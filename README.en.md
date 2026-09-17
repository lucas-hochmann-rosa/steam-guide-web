# 🏛️ Digital Guide

<p align="center">
  <a href="https://github.com/lucas-hochmann-rosa/steam-guide-web">
    <img src="https://img.shields.io/badge/GitHub-steam--guide--web-181717?style=for-the-badge&logo=github">
  </a>
  <a href="https://www.linkedin.com/in/lucas-hochmann-rosa">
    <img src="https://img.shields.io/badge/LinkedIn-Lucas_Hochmann_Rosa-0A66C2?style=for-the-badge&logo=linkedin">
  </a>
  <a href="#-technologies-used">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111">
  </a>
  <a href="#-technologies-used">
    <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge">
  </a>
</p>

<p align="center"><a href="README.md">🇧🇷 Português</a> · 🇺🇸 English</p>

> Official and interactive digital visitation guide created for the **2026 STEAM Fair** at Escola SESI Chapecó.

---

## ⚡ Quick Start

```bash
git clone https://github.com/lucas-hochmann-rosa/steam-guide-web.git
cd steam-guide-web
npm install
npm run dev
```

To build and preview the production version:

```bash
npm run build
npm start
```

---

## 📌 Overview

**Digital Guide** is an interactive web application designed to guide and engage visitors during the 2026 STEAM Fair at Escola SESI Chapecó. The experience leads visitors through the entire thematic room circuit, enables exploring spaces with interactive maps, scans room entrance QR codes, and records evaluations and feedback in real time.

The project was developed by **Lucas Hochmann Rosa**.

---

## ✨ Main Features

- Interactive visitation journey with percentage-based progress tracking.
- Device-camera integrated QR Code scanner for direct room discovery.
- Structured room rating system with star ratings and optional comments.
- Evaluation data export in CSV (Excel-compatible) and JSON formats.
- 2D interactive campus map with clickable hotspots and detailed Block F floor layout.
- Pedagogical team catalog with biographies, subject areas, and portfolios.
- Dedicated showcase for the West Sharks FTC #24823 robotics team and the BIOBUZZ season.
- Feedback survey integration directly with Google Forms.
- Progressive Web App (PWA) support and offline capability via Service Worker.

---

## 🧭 Table of Contents

- [Architecture](#-architecture)
- [Module Map](#-module-map)
- [Technologies used](#-technologies-used)
- [Experience Flow](#-experience-flow)
- [Project Construction Rules](#-project-construction-rules)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [Disclaimer](#-disclaimer)
- [License](#-license)
- [Author](#-author)

---

## 🏗️ Architecture

```text
steam-guide-web/
├── api/
│   └── evaluations.js
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── eslint.config.js
├── public/
│   ├── assets/
│   │   ├── equipe-2026/
│   │   ├── equipe-guia/
│   │   ├── salas/
│   │   └── westsharks/
│   ├── favicon-sesi.png
│   ├── icon-sesi-192.png
│   ├── icon-sesi-512.png
│   ├── manifest.webmanifest
│   └── sw.js
└── src/
    ├── components/
    │   ├── BottomNav.jsx
    │   ├── CompletionModal.jsx
    │   ├── EvaluationsModal.jsx
    │   ├── Footer.jsx
    │   ├── Navbar.jsx
    │   ├── QRScannerModal.jsx
    │   ├── RoomDetailModal.jsx
    │   ├── TeacherModal.jsx
    │   └── WelcomeModal.jsx
    ├── data/
    │   ├── rooms.js
    │   └── team.js
    ├── services/
    │   └── evaluationStorage.js
    ├── utils/
    │   └── assetPath.js
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

---

## 🗺️ Module Map

| File | Purpose |
| ------ | ------ |
| `index.html` | HTML entry point and page metadata. |
| `src/main.jsx` | React application initialization on root element. |
| `src/App.jsx` | React application, views, state, and guide routing. |
| `src/styles.css` | Visual styles and STEAM Fair branding. |
| `src/services/evaluationStorage.js` | Local persistence, average calculation, and CSV/JSON export. |
| `src/data/rooms.js` | Room catalog, school block data, and guide team members. |
| `src/data/team.js` | Biographical and academic data of the pedagogical team. |
| `api/evaluations.js` | Serverless Function for Vercel deployment and cloud sync. |
| `public/` | Images, PWA icons, and Service Worker served directly by the browser. |
| `vite.config.js` | Vite configuration, including automatic base path for GitHub Pages. |
| `vercel.json` | Build and output configuration for Vercel deployment. |
| `.github/workflows/deploy-pages.yml` | Automatic GitHub Pages publishing from the `main` branch. |

---

## 🧰 Technologies used

**Interface:** React 19.

**Build:** Vite 7.

**Language:** JavaScript with ES Modules.

**Icons:** Lucide React and optimized SVG vectors.

**Styling:** Modern CSS3 with custom properties.

---

## 🎲 Experience Flow

The experience starts with an identification screen where the visitor inputs their name. Then, the app unlocks the circuit through the following stages:

| Stage | Flow | Objective |
| --- | --- | --- |
| Journey | Interactive room list with pictures and lead educators. | Explore all thematic stations across the fair. |
| QR Reader | Camera feed for fast code detection at room entrances. | Open room detail instantly without manual searching. |
| Rating | 1 to 5 star rating and optional comments per room. | Record visitor feedback on the activities. |
| Export | Download evaluations in CSV and JSON formats. | Enable data analysis and event metrics. |
| Map | 2D map with clickable pins and Block F layout. | Facilitate navigation throughout the campus. |

---

## 📐 Project Construction Rules

- Identifiers, functions, states, and file structure are written in English.
- Interface text and documentation are written in Portuguese.
- Code comments are written in Portuguese and reserved for non-obvious decisions - the "why", not the "what".
- Development authorship belongs to **Lucas Hochmann Rosa**.
- The project maintains a professional architecture compatible with both Vercel and GitHub Pages.

---

## ⚙️ Requirements

- Node.js 20 or newer
- npm 10 or newer

---

## 🚀 Installation

```bash
npm install
```

---

## 🔐 Environment Configuration

This project does not require environment variables for basic local operation. If you want to connect a remote webhook to receive ratings, set `VITE_EVALUATIONS_API_URL` or `WEBHOOK_URL`.

---

## ▶️ Usage

Development server:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

---

## 🌐 Deployment

### Vercel

The `vercel.json` file already defines:

| Field | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Framework | `vite` |

### GitHub Pages

The `.github/workflows/deploy-pages.yml` workflow publishes the `dist` folder when there is a push to the `main` branch.

Expected address after deployment:

```text
https://lucas-hochmann-rosa.github.io/steam-guide-web/
```

On GitHub, the page should use **GitHub Actions** as the Pages source.

---

## ⚠️ Disclaimer

This project was created for an educational school event. Institutional logos and images appear in the context of the 2026 STEAM Fair at Escola SESI Chapecó.

The `dist/` directory is generated by the build and should not be committed.

---

## 📄 License

Licensed under MIT. Feel free to use, modify, and distribute, while keeping the copyright notice and crediting **Lucas Hochmann Rosa**.

---

## 👨‍💻 Author

**Lucas Hochmann Rosa**

- Repository: <https://github.com/lucas-hochmann-rosa/steam-guide-web>
- GitHub: <https://github.com/lucas-hochmann-rosa>
- LinkedIn: <https://www.linkedin.com/in/lucas-hochmann-rosa>
