//Déclaration des variables globales 

var country = 'France';
const companyName = "Worldgrid";
const linkedin = document.getElementById("linkedIn").href;
const website = document.getElementById("website").href;
const email = document.getElementById('email').value.trim();
const summaryInfos = document.getElementById('summary-infos');
const firstName = document.getElementById('first-name').value.trim();
const lastName = document.getElementById('last-name').value.trim();
var inputs = ['first-name', 'last-name','role', 'phone', 'email', 'address', 'country'];
const newInputs = ['custom-street', 'additional-street', 'custom-code', 'custom-city'];
var otherAddress = false;
var otherCountry = false;
var otherPhone = false;
const codeCity = document.getElementById("custom-code").value;
let prefix = '';

/**
 * Liste des adresses des sites de Bezons, Aix et Echirolles 
 * Utilisation des \n permet d'avoir des sauts de ligne lors de l'affichage dans la carte de visite
 */

const addresses = [
    {
      name : "Aix",
      street : "665 avenue Galiléee",
      PostalCode: "\nBP 20140",
      city: "\n13799 Aix-en-Provence"
    },
    {
      name : "Bezons",
      street : "80 quai Voltaire",
      PostalCode: "\nRiver Ouest - Indian Building - 2nd floor",
      city: "\n95877 Bezons Cedex"
    },
    {
      name : "Echirolles",
      street : "3 rue de Provence",
      PostalCode: "\n38130",
      city: "Echirolles"
    }
]

/**
 * Liste des codes des pays et la taille maximale du numéro de téléphone mobile sans compte le code 
 * Cette liste permet l'utilisateur de ne pas saisir trop des chiffres en fonction du code du pays 
 * qu'il a choisi dans la liste déroulante
 */

const countryCodes = [
  {"+33" : 9}, // France
  {"+32" : 8}, // Belgium
  {"+44" : 10}, // UK
  {"+49" : 10}, //Germany
  {"+34" : 8}, // Spain
  {"Other" : 13} // Other
]


/**
 * summaryMap Crée une liaison entre les champs du formulaire et les champs de la carte de visite, 
 * summaryMap permet de mettre à jour les informations de la carte en temps réel
*/ 
const summaryMap = {
    role: 'display-role',
    phone: 'display-phone',
    email: 'display-email',
    address: 'display-adress',
    country: 'display-country'
  };


let qrCode;

// Création du QR Code
function generateQRCode(text) {
    const qrCode = document.getElementById('qrcode');
    var qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();

    qrCode.innerHTML = qr.createSvgTag({
      scalable: true
    });
    qrCode.setAttribute('title', text);
}


/**
 * Cette fonction permet de récupérer les valeurs renseignés par l'utilisateur.
 * @returns rien
 */

function getFormData() {
    otherAddress = true ? document.getElementById('address').value === 'Other' : false;

    if(otherAddress){
      inputs = [...new Set([...inputs, ...newInputs])];
    }else{
      inputs = inputs.filter(item => !newInputs.includes(item));
    }

    if(otherCountry){
      inputs = [...new Set([...inputs, ...['other-country']])];
    }else{
      inputs = inputs.filter(item => item !== 'other-country');
    }

    const data = {};
    inputs.forEach(id => {
      data[id] = document.getElementById(id).value.trim();
      if(id === 'phone' && otherPhone){
        prefix = '+';
      }
    });
    
    const address = getAddress();
    
    data.street = address.street;
    data.addStreet = data['additional-street'];
    data.code = address.code;
    data.city = address.city
    data.customCity = address.customCity
    data.country = !otherCountry ? getCountry() : document.getElementById('other-country').value.trim();
    data.company = companyName;
    return data;
  }

  function getCountryCodeLength(code) {
    const entry = countryCodes.find(obj => Object.keys(obj)[0] === code);
  return entry ? entry[code] : null;
}


 /**
 * La fonction updateSummaryAndQRCode permet de mettre à jour les informations dans la carte de visite en temps réel.
 * @returns rien
 */

  function updateSummaryAndQRCode() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    otherCountry = true ? document.getElementById('country').value === 'Other' : false;
    otherAddress = true ? document.getElementById('address').value === 'Other' : false;

    if(!otherAddress){
      document.getElementById('country').value = 'France';
    }
    
    const selectElem = document.getElementById("country-code");

    selectElem.addEventListener('change', () => {
      prefix = selectElem.value === 'Other' ? '+' : '';
      document.getElementById('phone').value = prefix;
      otherPhone = selectElem.value === 'Other' ? true : false;
    });
    
    const maxLength = getCountryCodeLength(document.getElementById("country-code").value.trim())
    let phoneField = document.getElementById("phone");
    phoneField.maxLength = maxLength;
    
    const data = getFormData();
    displayNewCountry();
    
    let addressToDisplay = [];
    
    var addCountry = otherCountry ? document.getElementById('other-country').value : getCountry();
    let isBezons = document.getElementById('address').value.trim() === 'Bezons';
    
    if(!isBezons){
      addressToDisplay = [
        data.street,
        otherAddress ? data.addStreet+ '<br>' : '',
        otherAddress ? data.code.replace("<br>", "") + ' ' + data.city + '<br>' : data.code,
        !otherAddress ? data.city : '',
        otherAddress ? data.customCity + '<br>' : ''
      ].filter(str => str !== "").join('\n');
    }else{
      addressToDisplay = [
        data.code.replace("<br>", "") + '<br>',
        data.street,
        data.city
      ].filter(str => str !== "").join('\n');
    };
    
    inputs.forEach(id => {
      if(['first-name', 'last-name'].includes(id)){
        document.getElementById('display-names').textContent = firstName || lastName ? `${firstName.replace(/[0-9]/g, '')} ${lastName.replace(/[0-9]/g, '')}` : ''
      }else if(id === 'address'){
        document.getElementById('display-adress').innerHTML = !otherAddress ? addressToDisplay + " - " + addCountry : addressToDisplay + addCountry;
        document.getElementById('display-country').style.display = 'none';
      }else if(id === 'phone'){
        // On affiche l'icône(combiné d'un téléphone) seulement si le numéro de téléphone est renseigné
        data[id].length >= 1 ? document.getElementById('phone-section').style.display = 'block' : document.getElementById('phone-section').style.display = 'none';
        //On récupére les 9 derniers chiffres du numéro de téléphone et dans la carte de visite on les affiche au format +33 6 06 06 06 06
        // Avec une éspace après tous les 2 chiffres
        const lastDigits = data[id].replace(/\D/g, "");
        let formatted = "";
        for (let i = 0; i < lastDigits.length; i++) {
          formatted += lastDigits[i];
          if (i === 0 || (i > 0 && (i - 1) % 2 === 1 && i !== lastDigits.length - 1)) {
            formatted += ' ';
          }
        }
        if(otherPhone){
          document.getElementById('display-phone').textContent = data[id]
        }else{
          const countryCode = document.getElementById('country-code').value.trim();
          document.getElementById('display-phone').textContent = countryCode+" "+ formatted;
        }
      }else{
          try {
            if(!newInputs.includes(id)){
              document.getElementById(summaryMap[id]).textContent = data[id];
            }

          } catch (error) {
            console.error("An error occurred with the id :", id);
          }
      }
    });
    
    let address = '';
    if(otherAddress){
      address = `ADR;TYPE=WORK:;${data.addStreet.replace(/<br\s*\/?>/gi, '')};${data.street.replace(/<br\s*\/?>/gi, '')};${data.city.replace(/<br\s*\/?>/gi, '')};;${data.code.replace(/<br\s*\/?>/gi, '')};${data.country.replace(/<br\s*\/?>/gi, '')}\r\n`
    }else{
      address = `ADR;TYPE=WORK:;;${data.street.replace(/<br\s*\/?>/gi, '')};${data.city.replace(/<br\s*\/?>/gi, '')};;${data.code.replace(/<br\s*\/?>/gi, '')};${data.country.replace(/<br\s*\/?>/gi, '')}\r\n`
    }
    
    customizeJobTitle();
    let codeAndOrPhone = !otherPhone ? document.getElementById("country-code").value.trim() + data.phone : data.phone
    const phoneNber = data.phone.length >= 9 ? codeAndOrPhone : '';
    const vcard = 
  `BEGIN:VCARD\r\n` +
  `VERSION:3.0\r\n` +
  `N:${data['last-name']};${data['first-name']};;;\r\n` +
  `FN:${data['first-name']} ${data['last-name']}\r\n` +
  `ORG:${data.company}\r\n` +
  `TITLE:${data.role}\r\n` +
  `TEL;TYPE=CELL:${phoneNber}\r\n` +
  `EMAIL:${data.email}\r\n` +
  `URL;TYPE=WORK:${website}\r\n` +
  `URL;TYPE=HOME:${linkedin}\r\n` +
  address +
  `END:VCARD`;

    formatAddress();
    const stringInputs = [document.getElementById("first-name"), document.getElementById("last-name")];
    stringInputs.forEach(allowOnlyLetters);
  
    generateQRCode(vcard);
  }


inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', updateSummaryAndQRCode);
});

newInputs.forEach(id => {
    document.getElementById(id).addEventListener('input', updateSummaryAndQRCode);
});

['other-country', 'country', 'country-code'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateSummaryAndQRCode);
});


 /**
 * Lorsque l'utilisateur clique sur le bouton Download my business car,La carte de visite est téléchargé sous format png et 
 * le fichier .vcf et les deux ont sauvegardé dans un dossier zip sous le nom prenom_nom_business_card.zip
 */
document.getElementById("download-qr-code").addEventListener("click", async () => {
    await document.fonts.ready;
  
    const data = getFormData();

    const qpEncodeStr = (str) => {
      return Array.from(str)
        .map(char => {
          const code = char.charCodeAt(0);
          if (
            (code >= 33 && code <= 60 || code >= 62 && code <= 126) &&
            char !== '='
          ) {
            return char;
          } else {
            return '=' + code.toString(16).toUpperCase().padStart(2, '0');
          }
        })
        .join('');
    };
    
    let codeAndOrPhone = !otherPhone ? document.getElementById("country-code").value.trim() + data.phone : data.phone
    const phoneNber = data.phone.length >= 9 ? codeAndOrPhone : '';
    
    const firstName = data['first-name'];
    const lastName = data['last-name'];
    const company = data.company;
    const role = data.role;
    const email = data.email;
    let street = data.street.replace("<br>", ""); 
    let city = data.city.replace("<br>", "");
    const postalCode = data.code.replace("<br>", "");

    if (data.addStreet && data.addStreet.trim() !== "") {
      street += ", " + data.addStreet.trimStart();
    }

    let additionalCityInfo = data.customCity?.trimStart();
    if (additionalCityInfo && additionalCityInfo !== "") {
      city += ", " + additionalCityInfo || "";
    }

    //Création du contenu du fichier contact.vcf
    const lines = [    
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(lastName) + ";" + qpEncodeStr(firstName) + ";;;",
      "FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(`${firstName} ${lastName}`),
      "ORG;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(company),
      "TITLE;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(role),
      "TEL;TYPE=CELL,VOICE:" + phoneNber,
      "EMAIL:" + qpEncodeStr(email),
      "URL:" + qpEncodeStr(website),
      "URL:" + qpEncodeStr(linkedin),
      "ADR;CHARSET=UTF-8;TYPE=WORK:;;;;;" + postalCode + ";" + data.country,
      "LABEL;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE;TYPE=WORK:" + qpEncodeStr(`${street}\\n${postalCode}\\n${city}\\n${data.country}`),

      "END:VCARD"
    ];
    
    const vcardText = lines.join("\r\n") + "\r\n";
  
    const vcardBlob = new Blob([vcardText], {
      type: "text/x-vcard;charset=utf-8"
    });
    
    html2canvas(document.getElementById("summary-infos"), {
      useCORS: true,
      scale: 2
    }).then(canvas => {
      canvas.toBlob(async qrBlob => {
        const zip = new JSZip();
        zip.file("qr-code.png", qrBlob);
        zip.file("contact.vcf", vcardBlob);
  
        const content = await zip.generateAsync({ type: "blob" });
  
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = `${data['first-name']}_${data['last-name']}_business_card`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, "image/png");
    });
  });  
  

/**
 * Cette fonction permet de vérifier que le nom, le prénom et l'adresse sont renseignés 
 * avant d'envoyer le formulaire et créer le QR Code.Si n'est pas le cas, une notification est 
 * affiché pour informer l'utilisateur
 * @returns {field} Le nom du vide
*/
function checkEmptyFields(){
    let field = "";
    const data = getFormData();
    if(data['first-name'] === ''){
        field = "First name";
    }else if(data['last-name'] === ''){
        field = "Last name";
    }else if(data.email === ''){
        field = "Email address";
    }else if(data['first-name'] === '' && data['last-name'] === ''){
        field = "Email address";
    }
    return field;
}

/**
 * Cette fonction gère les notifications en cas d'erreur (champs obligatoire non renseigné par ex) et la création avec succès du business card 
  * @param {emptyField} - Le nom du champ (ex : first-name, last-name, email, ou vide si tous les champs sont renseignés) 
  * @param {fieldClass} - Le type de notification à afficher (erreur ou succès)
  * @param {message} - Le message customizé à afficher pour l'utilisateur
  * @returns rien
*/
function notify(emptyField, fieldClass, message){
    let notification = document.getElementById('notification');
    if(emptyField !== ''){
        notification.textContent = message;
        notification.className = ` notification ${fieldClass}`;
        document.getElementById('qrcode').style.display = "none";
        document.getElementById('download-qr-code').style.display = "none";
    }else{
        notification.textContent = message;
        notification.className = ` notification ${fieldClass}`;
    };

    notification.style.display = "block";
    setTimeout(function() {
        notification.style.display = "none";
        document.getElementsByClassName('form-section')[0].style.height = "fit-content"
    }, 5000);
}

/**
 * Cette fonction de récupèrer l'adresse copmlète au format JSON en fonction de nom du site choisi dans la liste déroulante 
 * contenant les sites(Aix-en-provence, Bezons et Echirolles) et si il choisi Other dans la liste, les champs inputs sont affichés 
 * ce qui lui permet de renseigner son adresse manuellement
* @returns {addressJson} Un objet JSON contenant la rue, la ville et le code postal du site séléctionné
*/

function getAddress(){
    const addressName = document.getElementById('address').value.trim();

    const address = addresses.find(add => add.name === addressName)
    const codeCity = document.getElementById("custom-code").value;
    const codeAndCity = document.getElementById('custom-code').value.trim().split(",");

    let addressJson = {}
    otherAddress = true ? document.getElementById('address').value === 'Other' : false;
    if(otherAddress){
      document.getElementById('custom-address').style.display = 'block';
      addressJson.street = document.getElementById('custom-street').value.trim() + '<br>'; // Contains the name and the street number
      addressJson.addStreet = '<br>'+ document.getElementById('additional-street').value.trim() + '<br>';
      
      addressJson.code = isValidPostalCodeCityFormat(codeCity) ? codeAndCity[0] + '<br>' : '';
      addressJson.city = isValidPostalCodeCityFormat(codeCity) ? codeAndCity[1].trimStart() : '';
      addressJson.customCity = document.getElementById('custom-city').value.trim();

      return addressJson
    }else{
      if(addressName !== 'Echirolles' && !otherAddress){
        addressJson.street = address.street.replace(/\n/g, '<br>');
        addressJson.code = address.PostalCode.replace(/\n/g, '<br>');
        addressJson.city = address.city.replace(/\n/g, '<br>')
      }else{
        addressJson.street = address.street.replace(/\n/g, '<br>');
        addressJson.code = address.PostalCode.replace(/\n/g, '<br>');
        addressJson.city = address.city;
      }
    }
    return addressJson
  }
  
function displayQrCode(){
    emptyField = checkEmptyFields();
    const emailInput = document.getElementById("email");
    const codeCity = document.getElementById("custom-code").value;

    const notifClass = emptyField !== '' ? 'error' : 'success';
    let message;
    if(emptyField !== ''){
        message = `${emptyField} must be provided`;
        notify(emptyField, notifClass, message);
    }else if(!isValidEmail(emailInput.value)){
      const errorSpan = document.getElementById("email-error");
      errorSpan.style.display = "inline";
      setTimeout(function() {
        errorSpan.style.display = "none";
      }, 5000);
    }else if(otherAddress && !isValidPostalCodeCityFormat(codeCity)){
      const errorCode = document.getElementById("city-error");
      errorCode.textContent = "Invalid format. Use: 'PostalCode,City. Minimum length for each is 3'";
      errorCode.className = "invalid";
      errorCode.style.display = "inline";
      document.getElementById('qrcode').style.display = "none";
      document.getElementById('download-qr-code').style.display = "none";
      setTimeout(function() {
        errorCode.style.display = "none";
      }, 10000);
    }else{
        let name = document.getElementById('first-name').value.trim()

        message = `Dear ${name}, your business card has been created successfully`
        notify(emptyField, 'success', message);
        document.getElementById('qrcode').style.display = "block";
        document.getElementById('download-qr-code').style.display = "block";
    }
}

/**
 * Cette fonction permet d'ajouter un saut de ligne lors de l'affichage du rôle dans la carte
  * @param {maxLength} - le nombre de caractères maximum pour ajout un saut de ligne 
  * @returns rien
*/

function customizeJobTitle(maxLength = 21) {
  const text = document.getElementById('role').value;
  const breakChars = /[ ,&./\\]/;
  let result = '';
  let start = 0;

  while (start < text.length) {
    let end = start + maxLength;

    if (end >= text.length) {
      result += text.slice(start);
      break;
    }

    let breakIndex = -1;
    for (let i = end; i > start; i--) {
      if (breakChars.test(text[i])) {
        breakIndex = i + 1;
        break;
      }
    }

    if (breakIndex === -1) breakIndex = end;

    result += text.slice(start, breakIndex).trim() + '<br>';
    start = breakIndex;
  }
  document.getElementById('display-role').innerHTML = result;
}


/**
  * Cette fonction permet d'ajouter un saut de ligne lors de l'affichage de l'adresse dans la carte de visite
  * Si il s'agit un petit écran (Sur un téléphone mobile par ex), cette fonction ajoute des sauts de lignes 
  * pour mieux afficher l'adresse 
  * @returns rien
*/
function formatAddress() {
  const addressField = document.getElementById("display-adress");
  let address = addressField.innerHTML;

  let lines = address.split(/<br\s*\/?>/gi).map(line => line.trim());

  if (window.innerWidth <= 480) {
    lines = lines.flatMap(line => {
      // On récupére le nom du pays qui se trouve à la fin de l'adresse
      const match = line.match(/\s+-\s+([A-Za-zÀ-ÿ\s]+)$/);
      if (match) {
        const country = match[1].trim();
        const beforeCountry = line.replace(match[0], "").trim();
        return [beforeCountry, country];
      }
      // Ajout d'un saut de line devant "2nd floor" pour les petits écrans
      if (line.includes("- 2nd floor")) {
        const parts = line.split("- 2nd floor");
        return [parts[0].trim(), "2nd floor"];
      }
      return [line];
    });
  } else {
    lines = lines.map(line => line.replace(/<br\s*\/?>/gi, '').trim());
  }
  addressField.innerHTML = lines.join("<br>");
}

function allowOnlyLetters(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); // On enlève tous les chiffres qu'il y a dans les inputs (Nom et prénom)
  });
}

/**
  * Cette fonction permet d'assurer le bon format de l'adresse mail 
  * @returns un booléen vrai si le format de l'adresse mail est correcte et faux si ce n'est pas le cas
*/
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

document.getElementById("address").addEventListener("change", function () {
  const selectedAddress = this.value;
  var customAddSection = document.getElementById('custom-address');
  selectedAddress === 'Other' ? customAddSection.style.display = 'block' : customAddSection.style.display = 'none';
  if(selectedAddress !== 'Other'){
    document.getElementById('display-country').textContent = 'France';
  }
})

/**
  * Cette fonction permet d'affiche le pays sélectionné dans la liste et permet l'utilisateur de 
  * renseigner un autre pays s'il n'est présent dans la liste 
  * @returns rien
*/

function displayNewCountry() {
  const name = getCountry();
  if(name === 'Other'){
    document.getElementById("country").style.width = '40%';
    document.getElementById("country").style.marginLeft = '2.5rem';
    document.getElementById("country").style.marginRight = '1rem';
    document.getElementById("other-country").style.display = 'block';
    document.getElementById('display-country').textContent = '';
    otherCountry = true;
    chosenCountry = document.getElementById('country').value.trim();
  }else{
    document.getElementById('display-country').textContent = country;
    document.getElementById("other-country").style.display = 'none';
    document.getElementById("country").style.width = '100%';
    document.getElementById("country").style.marginLeft = '0rem';
    document.getElementById("country").style.marginRight = '0rem';
  }
}

function getCountry() {
  const selectElement = document.getElementById("country");
  return selectElement.value;
}

/**
  * Cette fonction permet de valider le format du code postal et ville renseigner manuellement par l'utilisateur
  * Condition : code postal ,ville chacun doit avoir une longueur d'au moins 3
  * C'est à dire au moins 3 chiffres pour le code postal et au moins 3 caractères pour le nom de la ville
  * @param {input} - Le code postal et ville renseigné par l'utilisateur
  * @returns true si le format est correct si non false
*/
function isValidPostalCodeCityFormat(input) {
  const regex = /^\d{3,},.{3,}$/; 
  return regex.test(input);
}



window.onload = ()=>{
  updateSummaryAndQRCode();
  getFormData();

  const emailInput = document.getElementById("email");
  const errorSpan = document.getElementById("email-error");
  const errorCode = document.getElementById("city-error");
  const codeCity = document.getElementById("custom-code");

  codeCity.addEventListener("input", () => {
    const input = codeCity.value;
  
    if(!isValidPostalCodeCityFormat(input)){
      errorCode.textContent = "Invalid format. Use: 'PostalCode,City. Minimum length for each is 3'";
      errorCode.className = "invalid";
      errorCode.style.display = "inline";
    }else{
      errorCode.style.display = "none";
    };
    setTimeout(function() {
      errorCode.style.display = "none";
    }, 10000);
  });

  emailInput.addEventListener("blur", function () {
    if (!isValidEmail(emailInput.value)) {
      errorSpan.style.display = "inline";
    } else {
      errorSpan.style.display = "none";
    }

    setTimeout(function() {
      errorSpan.style.display = "none";
  }, 5000);

  });

  const phoneInput = document.getElementById('phone');

  document.getElementById('phone').value = prefix;
  
  phoneInput.addEventListener('input', () => {
    if (!phoneInput.value.startsWith(prefix)) {
      phoneInput.value = prefix;
    }else {
      // Garder le préfix et supprimer tous ce qui n'est pas un chiffre après le préfix
      const numberPart = phoneInput.value.slice(prefix.length).replace(/\D/g, "");
      phoneInput.value = prefix + numberPart;
    }
  });

  phoneInput.addEventListener('keydown', (e) => {
    const cursorPosition = phoneInput.selectionStart;
    if (
      (e.key === 'Backspace' && cursorPosition <= prefix.length) ||
      (e.key === 'Delete' && cursorPosition < prefix.length)
    ) {
      e.preventDefault();
    }
  });
  phoneInput.addEventListener('select', () => {
    if (phoneInput.selectionStart < prefix.length) {
      phoneInput.setSelectionRange(prefix.length, prefix.length);
    }
  });
  phoneInput.addEventListener('focus', () => {
    if (phoneInput.selectionStart < prefix.length) {
      phoneInput.setSelectionRange(prefix.length, prefix.length);
    }
  });
  

  window.addEventListener("DOMContentLoaded", formatAddress);
  window.addEventListener("resize", formatAddress);

}