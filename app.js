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
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function parseDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function nextJanuaryOrJuly(date) {
  const y = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month < 7 || (month === 7 && day === 1)) {
    return new Date(y + 1, 0, 1);
  }
  return new Date(y + 1, 6, 1);
}

function nextDniDate(dni, promotionDateValue) {
  const p = parseDate(promotionDateValue);
  const [dniMonth] = dni.split("-").map(Number);

  let candidate = new Date(p.getFullYear(), dniMonth - 1, 1);
  if (candidate <= p) {
    candidate = new Date(p.getFullYear() + 1, dniMonth - 1, 1);
  }
  return candidate;
}

function getNextCell(level, amount) {
  const cells = PAY_MATRIX[String(level)] || [];
  return cells.find(v => v >= amount) ?? null;
}

function getCurrentNextCell(level, basic) {
  const cells = PAY_MATRIX[String(level)] || [];
  const index = cells.findIndex(v => v >= basic);
  if (index === -1) return null;
  if (cells[index] === basic) return cells[index + 1] ?? null;
  return cells[index] ?? null;
}

function getPromotedCell(level, amount) {
  const cells = PAY_MATRIX[String(level)] || [];
  return cells.find(v => v >= amount) ?? null;
}

function calculatePromotionOption(level, basic, promoted) {
  const incremented = getCurrentNextCell(level, basic);
  if (incremented === null) {
    throw new Error("The existing basic pay is outside the available cells in the selected level.");
  }

  const fixed = getPromotedCell(promoted, incremented);
  if (fixed === null) {
    throw new Error("No equal or next higher cell was found in the promoted level.");
  }

  return { incremented, fixed };
}

function calculateDniOption(level, basic, promoted, promotionDateValue, dni) {
  /*
   * Simplified deferred-fixation model:
   * 1. On the promotion date, the employee continues on the existing basic for
   *    the purpose of the deferred option.
   * 2. At the existing DNI, one increment is applied in the old level.
   * 3. The resulting pay is then placed at the equal/next higher cell in the
   *    promoted level.
   *
   * The exact Railway case can have additional conditions; this is intentionally
   * isolated so the rule engine can be refined without changing the UI.
   */
  const dniDate = nextDniDate(dni, promotionDateValue);
  const incremented = getCurrentNextCell(level, basic);
  if (incremented === null) {
    throw new Error("The existing basic pay is outside the available cells in the selected level.");
  }

  const fixed = getPromotedCell(promoted, incremented);
  if (fixed === null) {
    throw new Error("No equal or next higher cell was found in the promoted level.");
  }

  return { incremented, fixed, dniDate };
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

function populateLevels() {
  currentLevel.innerHTML = '<option value="">Select Level</option>';
  promotedLevel.innerHTML = '<option value="">Select Level</option>';

  PAY_MATRIX_LEVELS.forEach(level => {
    currentLevel.add(new Option(`Level ${level}`, level));
    promotedLevel.add(new Option(`Level ${level}`, level));
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  clearError();

  try {
    const level = Number(currentLevel.value);
    const basic = Number(currentBasic.value);
    const promoted = Number(promotedLevel.value);
    const promotionDateValue = promotionDate.value;
    const dni = currentDni.value;
    const option = document.querySelector('input[name="fixationOption"]:checked').value;

    if (!level || !promoted || !basic || !promotionDateValue || !dni) {
      throw new Error("Please complete all required fields.");
    }

    if (promoted <= level) {
      throw new Error("The promoted Pay Level must be higher than the existing Pay Level.");
    }

    if (!PAY_MATRIX[String(level)] || !PAY_MATRIX[String(promoted)]) {
      throw new Error("The selected Pay Level is not available in the current matrix data.");
    }

    const pDate = parseDate(promotionDateValue);
    const result = option === "dni"
      ? calculateDniOption(level, basic, promoted, promotionDateValue, dni)
      : calculatePromotionOption(level, basic, promoted);

    const nextIncrement = option === "dni"
      ? addMonths(result.dniDate, 6)
      : nextJanuaryOrJuly(pDate);

    document.getElementById("rCurrentLevel").textContent = `Level ${level}`;
    document.getElementById("rCurrentBasic").textContent = formatRupees(basic);
    document.getElementById("rPromotionDate").textContent = formatDate(pDate);
    document.getElementById("rExistingDni").textContent = dni === "01-01" ? "1 January" : "1 July";
    document.getElementById("rIncrementedBasic").textContent = formatRupees(result.incremented);
    document.getElementById("rPromotedLevel").textContent = `Level ${promoted}`;
    document.getElementById("rFixedBasic").textContent = formatRupees(result.fixed);
    document.getElementById("rIncrease").textContent = formatRupees(result.fixed - basic);
    document.getElementById("rNextIncrement").textContent = formatDate(nextIncrement);

    if (option === "dni") {
      document.getElementById("rExplanation").textContent =
        `DNI option selected. The existing Level is advanced by one pay-matrix cell to ` +
        `${formatRupees(result.incremented)} at the applicable DNI stage, and the equal/next higher ` +
        `cell in Level ${promoted} is ${formatRupees(result.fixed)}.`;
    } else {
      document.getElementById("rExplanation").textContent =
        `Promotion-date option selected. One increment is allowed in the existing Level, moving ` +
        `basic pay from ${formatRupees(basic)} to ${formatRupees(result.incremented)}. ` +
        `The equal/next higher cell in Level ${promoted} is ${formatRupees(result.fixed)}.`;
    }

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(error.message);
  }
});

document.getElementById("printButton").addEventListener("click", () => window.print());
populateLevels();
