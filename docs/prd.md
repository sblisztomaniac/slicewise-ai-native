
# 📄 SliceWise – Product Requirements Document (PRD)

## 🧭 Overview

**SliceWise** is a lightweight, AI-assisted cap table simulation tool designed for founders, early employees, and angel investors who do *not* have a background in venture finance.

It helps users:
- Visualize cap table ownership
- Simulate SAFEs and funding rounds
- Understand dilution and exits
- Learn key equity concepts via plain-English AI explanations

---

## 🎯 MVP Goals

- No login/auth – use instantly
- Input founders + shares
- Add optional SAFE round
- Simulate 1 funding round
- Visual cap table (table + pie chart)
- Ask AI: “What just happened?”
- Explain equity terms inline (SAFE, dilution, etc.)

---

## 👤 Target Users

| Persona         | Pain Point                              | Solution                          |
|----------------|-------------------------------------------|-----------------------------------|
| Student founder| Doesn’t understand dilution math          | Visual + Copilot explanations     |
| Early employee | Confused about equity value over time     | Exit simulator + pie chart        |
| Angel investor | Unsure about % post-SAFE                  | SAFE input + updated ownership    |

---

## 🔑 Core Features in MVP

1. **Founder Input Form**
   - Add 1–3 founders
   - Enter share count or %

2. **SAFE Investment**
   - Enter SAFE amount + valuation cap
   - See converted shares

3. **Funding Round**
   - Enter round name, amount, valuation
   - See dilution impact

4. **Cap Table Display**
   - Table: name, shares, %
   - Pie chart: ownership breakdown

5. **AI Copilot**
   - Ask: “What just happened?”
   - Get natural language output: “You gave away 10% of the company to new investors…”

6. **ELI5 Explainers**
   - Hover: “What’s a SAFE?” ❓ → tooltip
   - All key terms demystified inline

---

## 📏 Success Criteria

| Metric                     | Target               |
|----------------------------|----------------------|
| Time-to-first simulation   | < 2 minutes          |
| Cap table comprehension    | 80% via AI replies   |
| First-time completion rate | 75%                  |
| Term tooltip usage         | 50%+ hover events    |

---

## 🔌 LLM Used

Claude 3 Sonnet (via OpenRouter) is used to:
- Explain dilution effects
- Answer natural language prompts
- Offer ELI5 equity learning at each step

---

## 📦 Deployment Notes

- Frontend: React + Tailwind
- Host: Vercel or Netlify
- Copilot: Claude via OpenRouter
- No backend required for MVP

---

## 🚀 Beyond MVP (Later)

- Add exit simulation
- Export to CSV/PDF
- Multi-round planner
- AI-generated walkthrough
- Collaborative sharing (view-only links)
