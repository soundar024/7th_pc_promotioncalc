const form = document.getElementById("calculatorForm");
const currentLevel = document.getElementById("currentLevel");
const promotedLevel = document.getElementById("promotedLevel");
const currentBasic = document.getElementById("currentBasic");
const promotionDate = document.getElementById("promotionDate");
const currentDni = document.getElementById("currentDni");
const resultCard = document.getElementById("resultCard");
const errorBox = document.getElementById("errorBox");

function formatRupees(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}

function parseDate(value) {
  const [y,m,d] = value.split("-").map(Number);
  return new Date(y,m-1,d);
}

function dateForYear(year, month) {
  return new Date(year, month-1, 1);
}

function levelIndex(level) {
  return PAY_MATRIX_LEVELS.findIndex(x => String(x) === String(level));
}

function cells(level) {
  return PAY_MATRIX[String(level)] || [];
}

function cellIndex(level, basic) {
  return cells(level).indexOf(Number(basic));
}

function oneIncrement(level, basic) {
  const list = cells(level);
  const idx = cellIndex(level, basic);
  if (idx < 0) throw new Error(`₹${Number(basic).toLocaleString("en-IN")} is not an exact cell in Level ${level}.`);
  return list[idx + 1] ?? list[idx];
}

function twoIncrements(level, basic) {
  const list = cells(level);
  const idx = cellIndex(level, basic);
  if (idx < 0) throw new Error(`₹${Number(basic).toLocaleString("en-IN")} is not an exact cell in Level ${level}.`);
  return list[Math.min(idx + 2, list.length - 1)];
}

function equalOrNextHigher(level, amount) {
  const list = cells(level);
  const found = list.find(v => v >= amount);
  if (found == null) throw new Error(`No equal or next higher cell is available in Level ${level}.`);
  return found;
}

/*
 Rule 10:
 - Promotion/appointment from 02 Jan through 01 Jul => next annual increment 01 Jan of following year.
 - Promotion/appointment from 02 Jul through 01 Jan => next annual increment 01 Jul.
 - Therefore promotion exactly on 01 Jan => 01 Jul of the same year.
 - Promotion exactly on 01 Jul => 01 Jan of the following year.
*/
function nextIncrementFromPromotionDate(promotion) {
  const y = promotion.getFullYear();
  const m = promotion.getMonth() + 1;
  const d = promotion.getDate();

  if (m === 1 && d === 1) return dateForYear(y, 7);
  if (m >= 1 && (m < 7 || (m === 7 && d === 1))) return dateForYear(y + 1, 1);
  return dateForYear(y + 1, 7);
}

function dniDateAfterPromotion(promotion, dni) {
  const [month] = dni.split("-").map(Number);
  let date = dateForYear(promotion.getFullYear(), month);
  if (date < promotion) date = dateForYear(promotion.getFullYear() + 1, month);
  return date;
}

function nextAnnualAfter(date) {
  const m = date.getMonth() + 1;
  return m === 1 ? dateForYear(date.getFullYear() + 1, 1) : dateForYear(date.getFullYear() + 1, 7);
}

function calculatePromotionOption(level, basic, promoted) {
  const inc = oneIncrement(level, basic);
  const fixed = equalOrNextHigher(promoted, inc);
  const dni = nextIncrementFromPromotionDate(parseDate(promotionDate.value));
  return { inc, fixed, firstDate: dni, nextDate: dateForYear(dni.getFullYear() + 1, dni.getMonth() + 1), promotionToDni: fixed };
}

function calculateDniOption(level, basic, promoted, promotion, dni) {
  const dniDate = dniDateAfterPromotion(promotion, dni);

  // From promotion date until DNI: next higher cell in promoted Level to the existing basic.
  const promotionToDni = equalOrNextHigher(promoted, basic);

  // On DNI: give two increments in lower Level, then equal/next higher in promoted Level.
  const twoInc = twoIncrements(level, basic);
  const fixed = equalOrNextHigher(promoted, twoInc);

  // After refixation on DNI, next annual increment remains on the same Jan/July cycle one year later.
  const nextDate = dateForYear(dniDate.getFullYear() + 1, dniDate.getMonth() + 1);

  return { inc: oneIncrement(level, basic), twoInc, fixed, firstDate: dniDate, nextDate, promotionToDni };
}

function populateLevels() {
  currentLevel.innerHTML = '<option value="">Select Level</option>';
  promotedLevel.innerHTML = '<option value="">Select Level</option>';
  PAY_MATRIX_LEVELS.forEach(level => {
    const label = `Level ${level}`;
    currentLevel.add(new Option(label, level));
    promotedLevel.add(new Option(label, level));
  });
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  resultCard.classList.add("hidden");
}

function clearError() {
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

form.addEventListener("submit", event => {
  event.preventDefault();
  clearError();

  try {
    const level = currentLevel.value;
    const basic = Number(currentBasic.value);
    const promoted = promotedLevel.value;
    const pDate = parseDate(promotionDate.value);
    const dni = currentDni.value;
    const option = document.querySelector('input[name="fixationOption"]:checked').value;

    if (!level || !promoted || !basic || !promotionDate.value || !dni) {
      throw new Error("Please complete all required fields.");
    }

    if (levelIndex(promoted) <= levelIndex(level)) {
      throw new Error("The promoted Pay Level must be higher than the existing Pay Level.");
    }

    if (cellIndex(level, basic) < 0) {
      throw new Error(`₹${basic.toLocaleString("en-IN")} is not an exact cell in Level ${level}. Please select the actual basic pay cell.`);
    }

    let result;
    if (option === "dni") {
      result = calculateDniOption(level, basic, promoted, pDate, dni);
    } else {
      result = calculatePromotionOption(level, basic, promoted);
    }

    document.getElementById("rCurrentLevel").textContent = `Level ${level}`;
    document.getElementById("rCurrentBasic").textContent = formatRupees(basic);
    document.getElementById("rPromotionDate").textContent = formatDate(pDate);
    document.getElementById("rPromotedLevel").textContent = `Level ${promoted}`;
    document.getElementById("rOneIncrement").textContent = formatRupees(result.inc);
    document.getElementById("rPromotionToDni").textContent = formatRupees(result.promotionToDni);
    document.getElementById("rFixedBasic").textContent = formatRupees(result.fixed);
    document.getElementById("rFirstIncrement").textContent = formatDate(result.firstDate);
    document.getElementById("rNextIncrement").textContent = formatDate(result.nextDate);

    if (option === "dni") {
      document.getElementById("rExplanation").textContent =
        `DNI option: from ${formatDate(pDate)} until the lower-post DNI (${formatDate(result.firstDate)}), ` +
        `pay is ${formatRupees(result.promotionToDni)} in Level ${promoted}. On the DNI, two increments ` +
        `in Level ${level} produce ${formatRupees(result.twoInc)}, and the pay is then placed at the ` +
        `equal/next higher cell of Level ${promoted}, i.e. ${formatRupees(result.fixed)}. ` +
        `The next annual increment is ${formatDate(result.nextDate)}.`;
    } else {
      document.getElementById("rExplanation").textContent =
        `Promotion-date option: one increment in Level ${level} raises basic pay from ` +
        `${formatRupees(basic)} to ${formatRupees(result.inc)}. The employee is then placed at the ` +
        `equal/next higher cell in Level ${promoted}: ${formatRupees(result.fixed)}. ` +
        `The next annual increment is ${formatDate(result.firstDate)}.`;
    }

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({behavior:"smooth", block:"start"});
  } catch (e) {
    showError(e.message);
  }
});

document.getElementById("printButton").addEventListener("click", () => window.print());
populateLevels();
