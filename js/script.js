//Déclaration des variables globales 

const country = 'France'
const companyName = "Worldgrid";
const linkedin = document.getElementById("linkedIn").href;
const website = document.getElementById("website").href;
const email = document.getElementById('email').value.trim();
const summaryInfos = document.getElementById('summary-infos');
const firstName = document.getElementById('first-name').value.trim();
const lastName = document.getElementById('last-name').value.trim();
const inputs = ['first-name', 'last-name','role', 'phone', 'email', 'address', 'country'];


//Liste des adresses des sites de Bezons, Aix et Echirolles
const addresses = [
    {
      name : "Aix",
      street : "665 avenue Galiléee",
      PostalCode: "\nBP 20140",
      city: "\n13799 Aix-en-Provence Cedex 03"
    },
    {
      name : "Bezons",
      street : "80 quai Voltaire",
      PostalCode: "\nRiver Ouest - Campus ATOS",
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
 * summaryMap Crée une liaison entre les champs du formulaire et les champs de la carte de visite, 
 * summaryMap permet de mettre à jour les informations de la carte
*/ 
const summaryMap = {
    role: 'display-role',
    phone: 'display-phone',
    email: 'display-email',
    address: 'display-adress',
    country: 'display-country'
  };


let qrCode;

function generateQRCode(text) {
    // Create QR code
    const qrCode = document.getElementById('qrcode');
    var qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();

    qrCode.innerHTML = qr.createSvgTag({
      scalable: true
    });
    qrCode.setAttribute('title', text);
}


function getFormData() {
    const data = {};
    inputs.forEach(id => {
      data[id] = document.getElementById(id).value.trim();
    });
    
    const address = getAddress();
    data.street = address.street;
    data.code = address.code;
    data.city = address.city
  
    data.country = country;
    data.company = companyName;
    return data;
  }

  function updateSummaryAndQRCode() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    
    const data = getFormData();
  
    const address = getAddress();
  
    data.street = address.street;
    data.code = address.code;
    data.city = address.city
  
    const addressToDisplay = [
      data.street,
      data.code,
      data.city
    ].join('\n');
  
    inputs.forEach(id => {
      if(['first-name', 'last-name'].includes(id)){
        document.getElementById('display-names').textContent = firstName || lastName ? `${firstName} ${lastName}` : ''
      }else if(id === 'address'){
        document.getElementById('display-adress').innerHTML = addressToDisplay;
      }else if(id === 'phone'){
        // The phone logo on the business card appears only when the phone number is provided by the user
        data[id].length > 3 ? document.getElementById('phone-section').style.display = 'block' : document.getElementById('phone-section').style.display = 'none';
        //We get the last 9 digits of the phone number from the input field and display them using the format 7 06 06 06 06
        const lastDigits = data[id].slice(3).replace(/\D/g, "").slice(0, 9);
        let formatted = "";
        for (let i = 0; i < lastDigits.length; i++) {
          formatted += lastDigits[i];
          if (i === 0 || (i > 0 && (i - 1) % 2 === 1 && i !== lastDigits.length - 1)) {
            formatted += ' ';
          }
        }
        document.getElementById('display-phone').textContent = "+33 "+ formatted;
      }else{
        document.getElementById(summaryMap[id]).textContent = data[id];
      }
    });
  
    customizeJobTitle();
  
    const vcard = 
  `BEGIN:VCARD\r\n` +
  `VERSION:3.0\r\n` +
  `N:${data['last-name']};${data['first-name']};;;\r\n` +
  `FN:${data['first-name']} ${data['last-name']}\r\n` +
  `ORG:${data.company}\r\n` +
  `TITLE:${data.role}\r\n` +
  `TEL;TYPE=CELL:${data.phone}\r\n` +
  `EMAIL:${data.email}\r\n` +
  `URL;TYPE=WORK:${website}\r\n` +
  `URL;TYPE=HOME:${linkedin}\r\n` +
  `ADR;TYPE=WORK:;;${data.street.replace(/<br\s*\/?>/gi, '')};${data.city.replace(/<br\s*\/?>/gi, '')};;${data.code.replace(/<br\s*\/?>/gi, '')};${data.country.replace(/<br\s*\/?>/gi, '')}\r\n` +
  `END:VCARD`;

    generateQRCode(vcard);
  }


inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', updateSummaryAndQRCode);
});


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

    const sanitizeInput = (str) => 
      str
      .replace(/[<br>\r\n]/g, '')
      .replace(/[^!-<>@-~ ]/g, c =>
        '=' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')
    );
    
    const addCity = data.city === 'Echirolles' ? qpEncodeStr(data.city) : qpEncodeStr(sanitizeInput(data.city))

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(data['last-name']) + ";" + qpEncodeStr(data['first-name']) + ";;;",
      "FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(`${data['first-name']} ${data['last-name']}`),
      "ORG;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(data.company),
      "TITLE;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + qpEncodeStr(data.role),
      "TEL;TYPE=CELL,VOICE:" + data.phone.replace(/\s+/g, ''),
      "EMAIL:" + qpEncodeStr(data.email),
      "URL:" + qpEncodeStr(website),
      "URL:" + qpEncodeStr(linkedin),

      "ADR;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE;TYPE=WORK:;" +
      ";" + 
      qpEncodeStr(data.street) + ";" +    
      data.code.replace("<br>", "") + ";" +      
      ";;" + 
      addCity + ";" +
      "France",
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
    }, 5000);
}

function getAddress(){
    const addressName = document.getElementById('address').value.trim();
    const address = addresses.find(add => add.name === addressName)
    const addressJson = {}
  
    addressJson.street = address.street.replace(/\n/g, '<br>');
    if(addressName !== 'Echirolles'){
      addressJson.code = address.PostalCode.replace(/\n/g, '<br>');
      addressJson.city = address.city.replace(/\n/g, '<br>')
    }else{
      addressJson.code = address.PostalCode.replace(/\n/g, '<br>');
      addressJson.city = address.city;
    }
    return addressJson
  }
  
function displayQrCode(){
    emptyField = checkEmptyFields();
    const notifClass = emptyField !== '' ? 'error' : 'success';
    let message;
    if(emptyField !== ''){
        message = `${emptyField} must be provided`;
        notify(emptyField, notifClass, message);
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

function formatAddress() {
  const addressField = document.getElementById("display-adress");
  let address = addressField.innerHTML;

  // Normalize line breaks for processing
  let lines = address.split(/<br\s*\/?>/gi).map(line => line.trim());
  if (window.innerWidth <= 480) {
    // Small screen: add line break before Cedex if found
    lines = lines.map(line => {
      return line.includes("Cedex") ? line.replace(/(.*)(\sCedex\s?\d*)/, "$1<br>$2") : line;
    });
  } else {
    // Larger screen: keep original structure without added <br> before Cedex
    lines = lines.map(line => line.replace(/<br\s*\/?>/gi, '').trim());
  }
  // Rebuild the address string
  addressField.innerHTML = lines.join("<br>");
}

document.getElementById("address").addEventListener("change", formatAddress);

window.onload = ()=>{
  updateSummaryAndQRCode();
  formatAddress();

  const phoneInput = document.getElementById('phone');
  const prefix = '+33';

  phoneInput.addEventListener('input', () => {
    if (!phoneInput.value.startsWith(prefix)) {
      phoneInput.value = prefix;
    }
  });

  phoneInput.addEventListener('keydown', (e) => {
    const cursorPosition = phoneInput.selectionStart;

    // Prevent backspace or delete within the prefix
    if (
      (e.key === 'Backspace' && cursorPosition <= prefix.length) ||
      (e.key === 'Delete' && cursorPosition < prefix.length)
    ) {
      e.preventDefault();
    }
  });

  // Prevent selecting and overwriting the prefix
  phoneInput.addEventListener('select', () => {
    if (phoneInput.selectionStart < prefix.length) {
      phoneInput.setSelectionRange(prefix.length, prefix.length);
    }
  });

  // On focus, move cursor after the prefix if placed inside it
  phoneInput.addEventListener('focus', () => {
    if (phoneInput.selectionStart < prefix.length) {
      phoneInput.setSelectionRange(prefix.length, prefix.length);
    }
  });

  window.addEventListener("DOMContentLoaded", formatAddress);
  window.addEventListener("resize", formatAddress);
}