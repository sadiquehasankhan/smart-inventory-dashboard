📦 SCM/OS — Smart Inventory & Supply Chain Control Tower
A fully functional browser-based supply chain dashboard built using pure HTML, CSS, and JavaScript — no frameworks, no libraries (Bootstrap used only for base utility resets).

🔗 Live Demo
👉 https://sadiquehasankhan.github.io/smart-inventory-dashboard/

✅ Features
- 5-page control tower: Dashboard, Stock Monitoring, Demand Forecast, Suppliers, Alerts & Reports
- Live system clock in the sidebar, updates every second
- Scrolling live ticker feed with rotating supply chain events
- KPI summary cards — SKUs tracked, stock health %, open POs, active alerts
- Custom Canvas-based line charts (no chart library) for:
  - Inbound vs Outbound units (14-day trend)
  - Demand forecast curve
- Stock Monitoring table with status filters (Healthy / Low Stock / Critical) and one-click Restock action
- Demand Forecast with switchable horizons (7 / 30 / 90 days), auto-recalculated velocity, projected demand and recommended order quantities
- Supplier Management — add new suppliers on the fly via an inline intake form, star-rated reliability score
- Alerts & Reports — resolvable alert list with severity tags, live-updating alert count
- One-click CSV report export of the full stock manifest
- Fully responsive layout — collapses to an icon-only sidebar on smaller screens

🎨 Page Color Palette (UI/UX concept)
| Page | Color | Hex |
|---|---|---|
| Dashboard | Cool Gray | #F8F9FA |
| Stock Monitoring | Warm Ivory | #FAF7F2 |
| Demand Forecast | Soft Blue | #F0F4F8 |
| Suppliers | Pale Sage | #F3F6F4 |
| Alerts & Reports | Light Peach | #FFF8F5 |

🛠️ Tech Stack
| Technology | Used For |
|---|---|
| HTML5 | Page structure and layout |
| CSS3 | Design tokens, theming, responsive layout, animations |
| JavaScript | Navigation, live data rendering, filtering, form handling |
| HTML Canvas API | Drawing the inbound/outbound and forecast line charts |
| Blob / URL API | Generating and downloading the CSV report |
| Bootstrap 5 | Base resets and utility behaviors only |


📁 File Structure
smart-inventory-dashboard/
│
├── index.html   → All pages, layout and markup
├── style.css    → Design tokens, theming and all styling
└── script.js    → Navigation, live data, charts, filters, CSV export

🚀 How to Run Locally
1. Download all 3 files
2. Keep them in the same folder
3. Double click index.html
4. Opens in your browser — done!

📖 What I Learned
- Building a multi-page single-file app with pure JS (no router library)
- Drawing live-updating line charts from scratch using the Canvas API
- Structuring a CSS design-token system (:root variables) for theming
- Dynamic DOM rendering and filtering of tabular data
- Generating and downloading CSV files client-side with the Blob API
- Building reusable UI patterns (chips, status pills, cards) in vanilla CSS
- Deploying a live website using GitHub Pages

👨‍💻 Author
Sadique Hasan Khan — Web Development internship opportunity offered by Codec Technologies

🙏 Acknowledgement
Built as part of the Codec Technologies Web Development learning program.
