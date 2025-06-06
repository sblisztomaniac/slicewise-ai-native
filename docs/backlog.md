# 🧾 SliceWise MVP Backlog

## ✅ \[MVP] Smart Sample Scenario with Guided Onboarding

**📌 Problem:**
Users feel stuck when starting from scratch. They don’t know what numbers to enter and lose interest.

**✅ Solution:**
Create a realistic, emotionally resonant sample cap table scenario:

* 2 Founders (e.g., 60/40 split)
* 10% ESOP pool
* 1 SAFE (\$200K @ \$4M cap)
* 1 Seed round (\$1M @ \$6M pre)

Include a Claude Copilot explanation on load that says:

> “This is a common setup for early-stage startups. Let’s see how ownership evolves.”

**🎯 Framework Alignment:**
\#3 – Aha moment in seconds
\#5 – Show working outcome
\#12 – Prioritize UX
\#13 – Test with real users

**✅ Acceptance Criteria:**

* [ ] “Load Sample Scenario” button exists
* [ ] Loads cap table with pre-filled data
* [ ] Claude explains setup in plain English
* [ ] Editable by user

---

## ✅ \[MVP] Explain My Funding Round (AI Copilot)

**📌 Problem:**
Users don’t understand what happened after entering a funding round — especially how dilution affects ownership.

**✅ Solution:**
Add a button or auto-trigger in the Copilot after a round is added. Claude should:

* Summarize what changed (ownership %s, new shares)
* Use simple, ELI5-style language
* Reference valuation, pre/post, and SAFE conversions

**🎯 Framework Alignment:**
\#2 – Don’t make users think
\#5 – Show it works
\#7 – Save user from costly mistakes
\#10 – Painkiller, not a vitamin

**✅ Acceptance Criteria:**

* [ ] Button appears after round added
* [ ] Claude summarizes round impact clearly
* [ ] Works for SAFE + equity rounds

---

## ✅ \[MVP] Add Funding Round Wizard

**📌 Problem:**
Filling a big form to add a funding round feels intimidating. Users drop off or make mistakes.

**✅ Solution:**
Create a step-by-step flow:

1. Choose round type (SAFE, Seed, Series A, etc)
2. Enter amount
3. Enter pre/post valuation
4. (Optional) Add investors
5. Preview dilution impact
6. Confirm round

**🎯 Framework Alignment:**
\#1 – Simplify
\#4 – Convince in onboarding
\#12 – UX-focused
\#14 – Test as a standalone idea

**✅ Acceptance Criteria:**

* [ ] Guided wizard flow implemented
* [ ] Clear navigation between steps
* [ ] Summary view before confirmation
* [ ] Claude explanation included after
