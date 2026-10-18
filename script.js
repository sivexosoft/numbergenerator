
const countries = [
  ["AF","Afghanistan","93"],["AL","Albania","355"],
  ["DZ","Algeria","213"],["AR","Argentina","54"],
  ["AU","Australia","61"],["AT","Austria","43"],
  ["BD","Bangladesh","880"],["BE","Belgium","32"],
  ["BR","Brazil","55"],["BG","Bulgaria","359"],
  ["KH","Cambodia","855"],["CA","Canada","1"],
  ["CL","Chile","56"],["CN","China","86"],
  ["CO","Colombia","57"],["HR","Croatia","385"],
  ["CY","Cyprus","357"],["CZ","Czechia","420"],
  ["DK","Denmark","45"],["EG","Egypt","20"],
  ["EE","Estonia","372"],["FI","Finland","358"],
  ["FR","France","33"],["GE","Georgia","995"],
  ["DE","Germany","49"],["GH","Ghana","233"],
  ["GR","Greece","30"],["HK","Hong Kong","852"],
  ["HU","Hungary","36"],["IS","Iceland","354"],
  ["IN","India","91"],["ID","Indonesia","62"],
  ["IR","Iran","98"],["IQ","Iraq","964"],
  ["IE","Ireland","353"],["IL","Israel","972"],
  ["IT","Italy","39"],["JP","Japan","81"],
  ["JO","Jordan","962"],["KE","Kenya","254"],
  ["KW","Kuwait","965"],["LB","Lebanon","961"],
  ["MY","Malaysia","60"],["MV","Maldives","960"],
  ["MX","Mexico","52"],["MA","Morocco","212"],
  ["NP","Nepal","977"],["NL","Netherlands","31"],
  ["NZ","New Zealand","64"],["NG","Nigeria","234"],
  ["NO","Norway","47"],["OM","Oman","968"],
  ["PK","Pakistan","92"],["PS","Palestine","970"],
  ["PE","Peru","51"],["PH","Philippines","63"],
  ["PL","Poland","48"],["PT","Portugal","351"],
  ["QA","Qatar","974"],["RO","Romania","40"],
  ["RU","Russia","7"],["SA","Saudi Arabia","966"],
  ["RS","Serbia","381"],["SG","Singapore","65"],
  ["ZA","South Africa","27"],["KR","South Korea","82"],
  ["ES","Spain","34"],["LK","Sri Lanka","94"],
  ["SE","Sweden","46"],["CH","Switzerland","41"],
  ["TW","Taiwan","886"],["TZ","Tanzania","255"],
  ["TH","Thailand","66"],["TN","Tunisia","216"],
  ["TR","Turkey","90"],["UG","Uganda","256"],
  ["UA","Ukraine","380"],["AE","United Arab Emirates","971"],
  ["GB","United Kingdom","44"],["US","United States","1"],
  ["UY","Uruguay","598"],["VE","Venezuela","58"],
  ["VN","Vietnam","84"],["YE","Yemen","967"],
  ["ZM","Zambia","260"],["ZW","Zimbabwe","263"],
  ["BO","Bolivia","591"],["BA","Bosnia and Herzegovina","387"],
  ["BW","Botswana","267"],["BN","Brunei","673"],
  ["CM","Cameroon","237"],["CR","Costa Rica","506"],
  ["DO","Dominican Republic","1809"],["EC","Ecuador","593"],
  ["ET","Ethiopia","251"],["FJ","Fiji","679"],
  ["GT","Guatemala","502"],["JM","Jamaica","1876"],
  ["KZ","Kazakhstan","7"],["KG","Kyrgyzstan","996"],
  ["LU","Luxembourg","352"],["MT","Malta","356"],
  ["MU","Mauritius","230"],["MM","Myanmar","95"],
  ["PA","Panama","507"],["PY","Paraguay","595"],
  ["PR","Puerto Rico","1787"],["SN","Senegal","221"],
  ["SK","Slovakia","421"],["SI","Slovenia","386"],
  ["SD","Sudan","249"],["SY","Syria","963"],
  ["TJ","Tajikistan","992"],["TT","Trinidad and Tobago","1868"],
  ["UZ","Uzbekistan","998"],["ZM","Zambia","260"]
];

// Elements
const countrySearch = document.getElementById("countrySearch");
const countrySelect = document.getElementById("country");
const phoneInput = document.getElementById("phone");
const messageInput = document.getElementById("message");
const callingCode = document.getElementById("callingCode");
const errorBox = document.getElementById("error");
const result = document.getElementById("result");
const generatedLink = document.getElementById("generatedLink");
const copyStatus = document.getElementById("copyStatus");

let chosenCountry = countries.find(c => c[0] === "PK");

function flagEmoji(iso) {
  return iso.replace(/[A-Z]/g, ch =>
    String.fromCodePoint(127397 + ch.charCodeAt(0))
  );
}

function renderCountries(search = "") {
  const query = search.trim().toLowerCase().replace(/^\+/, "");

  const matches = countries.filter(([iso, name, code]) =>
    name.toLowerCase().includes(query) ||
    iso.toLowerCase() === query ||
    code.includes(query)
  );

  countrySelect.innerHTML = "";

  matches.forEach(([iso, name, code]) => {
    const option = document.createElement("option");
    option.value = iso;
    option.textContent = `${flagEmoji(iso)} ${name} (+${code})`;
    countrySelect.appendChild(option);
  });

  if (!matches.length) {
    const option = document.createElement("option");
    option.textContent = "No matching country";
    option.disabled = true;
    countrySelect.appendChild(option);
    return;
  }

  if (!matches.some(c => c[0] === chosenCountry[0])) {
    chosenCountry = matches[0];
  }

  countrySelect.value = chosenCountry[0];
  updateCallingCode();
}

function updateCallingCode() {
  const selected = countries.find(
    c => c[0] === countrySelect.value
  );

  if (selected) chosenCountry = selected;

  callingCode.textContent = `+${chosenCountry[2]}`;
}

function buildNumber() {
  const code = chosenCountry[2];
  const raw = phoneInput.value.trim();
  let digits = raw.replace(/\D/g, "");

  if (!digits) return "";

  // Remove country code if a complete international number was entered.
  if (raw.startsWith("+") && digits.startsWith(code)) {
    digits = digits.slice(code.length);
  } else if (
    !raw.startsWith("+") &&
    digits.startsWith(code) &&
    digits.length > 7
  ) {
    digits = digits.slice(code.length);
  }

  // Remove local leading zeroes.
  digits = digits.replace(/^0+/, "");

  return code + digits;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  result.hidden = true;
}

function generateLink() {
  if (!phoneInput.value.trim()) {
    showError("Please enter a phone number.");
    phoneInput.focus();
    return;
  }

  const fullNumber = buildNumber();
  const nationalNumber = fullNumber.slice(
    chosenCountry[2].length
  );

  if (
    !/^\d{7,15}$/.test(fullNumber) ||
    nationalNumber.length < 4
  ) {
    showError(
      "Please check the phone number and selected country."
    );
    phoneInput.focus();
    return;
  }

  const message = messageInput.value.trim();

  const url =
    `https://wa.me/${fullNumber}` +
    (message ? `?text=${encodeURIComponent(message)}` : "");

  generatedLink.value = url;
  errorBox.hidden = true;
  result.hidden = false;
  copyStatus.textContent = "";
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    copyStatus.textContent = "Link copied successfully!";
  } catch {
    generatedLink.focus();
    generatedLink.select();

    const success = document.execCommand("copy");

    copyStatus.textContent = success
      ? "Link copied successfully!"
      : "Select the link and copy it manually.";
  }
}

// Events
countrySearch.addEventListener("input", () => {
  renderCountries(countrySearch.value);
});

countrySelect.addEventListener("change", () => {
  updateCallingCode();
  errorBox.hidden = true;
});

document.getElementById("generate").addEventListener(
  "click",
  generateLink
);

phoneInput.addEventListener("keydown", event => {
  if (event.key === "Enter") generateLink();
});

document.getElementById("copyLink").addEventListener(
  "click",
  () => copyText(generatedLink.value)
);

document.getElementById("openChat").addEventListener(
  "click",
  () => {
    if (generatedLink.value) {
      window.open(
        generatedLink.value,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }
);

// Initial setup
renderCountries();
countrySelect.value = "PK";
updateCallingCode();
