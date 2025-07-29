# 🚀 Quant Data (React + Vite)

A front-end application built with **React 19** and **Vite**, designed for high-performance and modern development. Includes ESLint integration and TailwindCSS for styling.

---

## 📦 Project Info

- **Name**: `quant-data-fe`
- **Version**: `0.0.0`
- **Private**: `true`
- **Module Type**: `module`

---

## 📁 Project Structure

Uses the following core technologies:

- **React 19** — Component-based UI development
- **Vite 6** — Lightning-fast bundler and dev server
- **TypeScript** — Static type-checking
- **TailwindCSS** — Utility-first CSS styling
- **Sass** — Optional preprocessor for scoped styles
- **ESLint** — Linting with support for React and hooks
- **Prettier** — Code formatting
- **CodeMirror** — In-browser code editor
- **D3** — Data visualization
- **React Flow** — Visual graphing and node editor

---

## 🛠️ Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the development server |
| `npm run build`   | Build the app for production |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint on the codebase   |

---

## 📚 Dependencies

### Runtime Dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### Development Dependencies

````json
{
  "@codemirror/autocomplete": "^6.18.6",
  "@codemirror/basic-setup": "^0.20.0",
  "@codemirror/closebrackets": "^0.19.2",
  "@codemirror/commands": "^6.8.1",
  "@codemirror/highlight": "^0.19.8",
  "@codemirror/lang-sql": "^6.8.0",
  "@codemirror/language": "^6.11.0",
  "@codemirror/matchbrackets": "^0.19.4",
  "@codemirror/rectangular-selection": "^0.19.2",
  "@codemirror/state": "^6.5.2",
  "@codemirror/theme-one-dark": "^6.1.2",
  "@codemirror/view": "^6.36.8",
  "@types/react-calendar-heatmap": "^1.9.0",
  "clsx": "^2.1.1",
  "d3": "^7.9.0",
  "date-fns": "^4.1.0",
  "prettier": "^3.5.3",
  "react": "^19.1.0",
  "react-calendar-heatmap": "^1.10.0",
  "react-datepicker": "^8.3.0",
  "react-dom": "^19.1.0",
  "react-icons": "^5.5.0",
  "react-router-dom": "^6.14.2",
  "react-syntax-highlighter": "^15.6.1",
  "react-tooltip": "^4.5.1",
  "reactflow": "^11.11.4",
  "sass": "^1.88.0",
  "vite-tsconfig-paths": "^5.1.4"
}

---

## 🧪 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
````

## Build

Build the image
```bash
docker build -t sparqd/ui .
```

Run the container
```bash
docker run --rm -p 3000:80 sparqd/ui
```

## Quickstart
Use provided Docker Compose. Make sure backend service already running.
```bash
docker compose up -d
```