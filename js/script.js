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
      }else{
        document.getElementById(summaryMap[id]).textContent = data[id];
      }
    });
  
    customizeDisplayRole('display-role');
  
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
      addCity + ";" +   
      ";;" + 
      qpEncodeStr(sanitizeInput(data.code)) + ";" +   
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
 * Cette fonction permet d'ajouter un saut de ligne lors de l'affichage du rôle dans la carte
  * @param {id} - l'identifiant du champ input du formulaire 
  * @returns rien
*/
function customizeDisplayRole(id) {
    const role = document.getElementById(id);
    if (role) {
      const content = role.textContent;
  
      // Add a line break after the first 20 characters
      const newContent = content.length > 20
        ? content.slice(0, 19) + '<br>' + content.slice(19)
        : content;
        role.innerHTML = newContent;
    }
  }


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
    const data = getFormData();
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

  
window.onload = ()=>{
    updateSummaryAndQRCode();
}