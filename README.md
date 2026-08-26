# 7th CPC Promotion Pay Calculator

Browser-only 7th CPC promotion pay calculator.

## No server required

- No PHP
- No MySQL
- No XAMPP
- No backend
- No login
- No database

Everything runs in JavaScript in the user's browser.

## Files

```text
7th-cpc-pay-calculator/
├── index.html
├── app.js
├── pay-matrix.js
├── style.css
└── README.md
```

## Run locally

Open `index.html` directly in a browser.

## GitHub Pages

1. Push the files to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Save.

GitHub will provide a URL similar to:

`https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`

## Current calculation

The current prototype:
1. Reads existing basic pay.
2. Calculates one increment.
3. Finds the equal/next higher cell in the promoted level.
4. Shows the indicative next increment date.

## Important

This is an indicative prototype. Verify the official 7th CPC matrix and applicable Government/Railway rules before official use.

V1 contains Levels 1-10. Levels 11-18 should be verified and added before production use.

## Planned

- Complete Level 1-18 matrix
- Exact Rule 13 logic
- Correct DNI option
- Railway-specific promotion/MACP cases
- Increment-date rules
- Pay fixation statement
- Print/PDF
- DA/HRA and gross-pay comparison
- PWA/offline installation
