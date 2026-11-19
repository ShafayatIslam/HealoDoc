# Virtual Hospital – Redesigned Frontend

## Run the project
1. Extract the ZIP archive.
2. Open the `virtual-hospital` folder in VS Code.
3. Open `appointment.html`, `prescription.html`, or `notification.html` using Live Server (recommended), or open the HTML file directly in a modern browser.

No build tools, frameworks, or package installation are required. This project uses HTML5, CSS3 and Vanilla JavaScript.

## Pages
- `appointment.html`: patient appointments with status tabs, appointment cards and cancellation.
- `prescription.html`: patient prescription cards, medicine details, print/download-to-PDF and delete demo action.
- `notification.html`: admin notification center with category and severity filters, read/unread state, dismiss and mark-all-read actions.

## Files
- `common.css`: shared dashboard layout, components and responsive rules.
- `appointment.css`, `prescription.css`, `notification.css`: page-specific styles.
- Each page has its own JavaScript file for its interactions and demo data.

## Notes
- The supplied data is demonstration data stored in JavaScript arrays. Refreshing the page resets changes.
- Doctor/profile photos and the Inter font are loaded from external image/font hosts, so an internet connection is needed for those assets. The UI and interactions work without a backend.
- Print opens the browser print dialog; choose “Save as PDF” to create a PDF.
- Connect your Spring Boot API in the corresponding JavaScript file when backend endpoints are ready. Do not place credentials or sensitive medical information in frontend code.
