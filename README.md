# Mahjong Scores

Mahjong Scores is a web application for tracking and managing Mahjong game sessions and scores.
It is built using modern web technologies with a focus on clarity, simplicity, and maintainability.

This project serves both as a practical tool and as a portfolio project demonstrating modern React and TypeScript development practices.

---

## Features

- Track Mahjong game sessions and scores
- View previously played sessions
- Rules overview page
- Clean navigation with a responsive layout
- Simple and readable user interface using Tailwind CSS

---

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Font Awesome
- Routing: Next.js built-in routing

---

## Project Structure (high-level)
```text
app/
  layout.tsx        Root layout (navigation, metadata, global styles)
  page.tsx          Home page
  sessions/         Sessions overview
  rules/            Rules page

public/
  icon.png          Application / navbar icon
```
---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm or yarn

### Installation

git clone https://github.com/KvGasteren/mahjong-scores.git
cd mahjong-scores
npm install

### Run locally

npm run dev

Then open your browser at:

http://localhost:3000

---

## Design Decisions

- Uses the Next.js App Router to align with current best practices
- TypeScript-first approach for improved reliability and maintainability
- Minimal UI to keep the focus on data and usability
- Sticky navigation for easy access across pages

---

## Possible Future Improvements

- Editable score entries
- Player management
- Session statistics and summaries
- Persistent data storage
- Authentication for multi-user support

---

## Author

**Koen van Gasteren**  
Working on software, analysis, and systems that are meant to be understood and maintained.

- GitHub: https://github.com/KvGasteren
- LinkedIn: https://linkedin.com/in/koenvangasteren
- Portfolio: https://koenvangasteren.nl

---

## License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this project.
