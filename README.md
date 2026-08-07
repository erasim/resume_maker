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

## Project Structure

```
src/
├── App.js                 # State management, layout & theme pickers, print
├── App.css                # Styling (app chrome, editor, resume templates)
├── index.js               # Entry point
├── components/
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
