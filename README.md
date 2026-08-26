# 7th CPC Promotion Pay Fixation Calculator — V2

Browser-only calculator for indicative 7th CPC promotion pay fixation.

## V2 changes

- Corrects the previous error where the increment date was simply calculated as promotion date + 1 year.
- Uses the 1 January / 1 July annual increment cycle.
- Adds existing DNI input.
- Adds separate promotion-date and DNI fixation options.
- Shows the calculation steps.
- Keeps the calculation engine separate from the UI.
- Still requires no PHP, MySQL or XAMPP.

## Important rule basis

The Department of Expenditure has issued clarifications on Rule 10 of the CCS (Revised Pay) Rules, 2016, including cases involving promotion/financial upgradation on 1 January and 1 July.

Railway Board has separately issued Railway-specific instructions on pay fixation and the availability of the DNI option.

This V2 is still an indicative software implementation. The DNI route and special 1 January/1 July cases should be verified against the exact Railway Board order applicable to the employee before official use.

## Project

```text
7th-cpc-pay-calculator/
├── index.html
├── app.js
├── pay-matrix.js
├── style.css
├── README.md
└── .gitignore
```

## GitHub Pages

Keep `index.html` at repository root and use:

`Settings → Pages → Deploy from a branch → main → / (root)`

## Next development step

Before calling this an official calculator, verify the complete Level 1–18 matrix and implement the exact Railway Rule 13 / DNI scenarios, including promotion on 1 January, promotion on 1 July, and cases where two increments are involved.
