# ResumeForge

An attractive, interactive resume builder with a live preview. Type your details on the left and watch your resume update instantly on the right — then download it as a polished PDF.

Built with **React 19** and **Create React App** — no external UI libraries.

## Features

- **Live preview** — every keystroke updates the resume instantly
- **4 layout templates** — Classic (sidebar), Modern (banner), Minimal, Sidebar Right
- **6 accent color themes** — restyle the whole document with one click
- **Complete sections** — personal details, professional summary, work experience, education, skills, and languages
- **Dynamic entries** — add, remove, and reorder experience, education, skills, and languages
- **Skill level bars** — drag a slider to adjust proficiency in the preview
- **"Currently working here"** toggle on experience entries
- **PDF download** — print-optimized A4 output via the browser
- **Reset** — restore the sample data anytime
- **Auto-save** — your resume and settings are saved automatically in the browser
- **Server backup** — your resume is also saved to the server (anonymous device ID, no login needed) and is saved again before you download the PDF
- **Fully responsive** — works on desktop and mobile

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)

### Installation

```bash
npm install
```

### Run in development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser. The page reloads as you make changes.

### Build for production

```bash
npm run build
```

Builds the app for production to the `build` folder, optimized for the best performance.

### Run tests

```bash
npm test
```

Launches the test runner in the interactive watch mode.

## How to Use

1. **Edit** your details in the form panel — name, title, contact info, summary, work experience, education, skills, and languages.
2. **Switch layouts** and **accent colors** from the header to find a style you like.
3. Click **Download PDF** and save your resume as a print-ready A4 document.

## Setting Up the Backend (InfinityFree)

The app saves your resume to a small PHP + MySQL API so your data is backed up on the server (identified by an anonymous device ID stored in your browser — no account needed). It is built to run on **InfinityFree** (PHP + MySQL only — no Node.js).

### 1. Create the database

In the InfinityFree control panel go to **MySQL Databases** and create a database and a database user. Note the hostname (something like `sql110.infinityfree.com`), database name (e.g. `if0_12345678_resumeforge`), user, and password.

### 2. Import the schema

Open phpMyAdmin, select your database, go to the **Import** tab, and upload [`backend/database.sql`](backend/database.sql). This creates the `resumes`, `admins`, and `admin_sessions` tables.

### 3. Upload the API

Upload the contents of the [`backend/api`](backend/api) folder (including the `.htaccess` file) to `htdocs/api` in your InfinityFree file manager.

### 4. Configure the API

Edit `backend/api/config.php` and set `$dbHost`, `$dbName`, `$dbUser`, and `$dbPass` to the credentials from step 1.

### 5. Point the app at your API

Create a `.env` file in this project root:

```
REACT_APP_API_BASE=https://your-domain.epizy.com/api
```

> **Important:** the API URL must use `https://`. The site is served over HTTPS, and browsers block mixed content (HTTPS page calling an HTTP API). If your InfinityFree domain doesn't have SSL yet, enable the free SSL certificate in the control panel.

Then rebuild and redeploy:

```bash
npm run build
npx --yes gh-pages -d build
```

### 6. Create the admin account (one-time)

The backend ships with no admin account by default. After the API is uploaded, visit:

```
https://your-domain.epizy.com/api/setup.php
```

Enter an admin username and password to create the first account, then **delete `setup.php` from the server** so nobody else can use it.

### How it works

- `GET /api/resume.php?deviceId=...` — fetch the resume saved for this device
- `PUT /api/resume.php` — save the resume (`{ deviceId, data }`)
- `POST /api/resume.php?action=download` — increment the download counter for a device
- `POST /api/admin.php?action=login` — admin login, returns a session token
- `GET /api/admin.php?action=resumes` — list every saved resume (Bearer token)
- `POST /api/admin.php?action=logout` — end the admin session

The app loads the server copy on start, auto-saves every change (debounced), and does a final save before **Download PDF**. If the server is unreachable, the app keeps working with browser storage alone.

The **Admin** button in the header opens a login panel; after signing in you can see every resume saved on the server (name, device ID, download count, last updated) and expand each one to inspect its data.

## Project Structure

```
backend/
├── database.sql          # MySQL schema (resumes, admins, admin_sessions)
└── api/
    ├── config.php        # DB credentials + CORS + helpers (EDIT THIS)
    ├── resume.php        # GET / PUT the resume by device ID, download counter
    ├── admin.php         # admin login / list all resumes / logout
    ├── setup.php         # one-time admin creation (delete after use)
    └── .htaccess         # blocks direct access to config.php

src/
├── App.js                 # State management, layout & theme pickers, print, server sync
├── App.css                # Styling (app chrome, editor, resume templates)
├── api.js                 # HTTP client for the PHP API
├── index.js               # Entry point
├── components/
│   ├── AdminPanel.js     # Admin login + dashboard listing all resumes
│   ├── EditorPanel.js     # Form sections (personal, summary, experience, education, skills, languages)
│   └── ResumePreview.js   # Live resume rendering for all 4 layouts
└── data/
    └── defaults.js        # Sample resume data
```

## Available Scripts

| Script          | Description                                  |
| --------------- | -------------------------------------------- |
| `npm start`     | Runs the app in development mode             |
| `npm test`      | Launches the test runner in watch mode       |
| `npm run build` | Builds the app for production to `build/`    |
| `npm run eject` | Ejects the build tooling (one-way, irreversible) |

## License

This project is for personal use. Feel free to fork and customize it for your own resume.
