# 🚀 SliceWise

SliceWise is a lightweight, no-login AI-powered tool that helps startup founders, employees, and angel investors simulate their cap tables, model SAFEs, and understand dilution — all without needing to be a venture finance expert.

> Visual + Conversational = Learning by Doing

---

## 🧩 What You Can Do

- Add founders and share counts
- Simulate SAFE investment rounds
- Visualize updated cap table and ownership
- Ask “What happened?” in natural language
- Learn key equity terms via ELI5-style AI Copilot (Claude Sonnet 4)

---

## 📁 Folder Structure

```
/frontend       # Full working MVP UI (Bolt-based)
/docs           # Planning and product strategy
  ├── prd.md
  ├── backlog.md
  ├── sprintplan.md
  ├── datamodel.md
```

---

## 🧠 Tech Stack

- React + TypeScript + Tailwind CSS
- Recharts (for pie chart)
- Claude Sonnet 4 via OpenRouter (AI Copilot)
- Vite for bundling
- No backend — all in-browser for MVP

---

## ▶️ How to Run

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`

---

## 🧠 Claude Copilot (via OpenRouter)

To enable Copilot:
1. Get a free API key from https://openrouter.ai
2. Add it to `.env` as:

```
VITE_OPENROUTER_API_KEY=sk-...
```

3. Now ask anything like:

> “What happens if I raise $500k at a $4M cap?”

And SliceWise will explain in plain English.

---

## ✨ Coming Soon

- Multi-round planning
- Exit simulation
- Export/share
- Embedded tutorials

