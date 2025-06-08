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

# 🧾 Epic: Funding Round UX Improvements

These issues aim to improve the user experience around adding and understanding funding rounds in SliceWise.

---

### ✅ Issue 1: Explain Suggested Round Inputs

**Problem:** Users don’t know what valuation or amount to input.

**Solution:** Add an info section or toggle below the round form.

**Explanation Should Include:**

* Typical seed round ranges (\$500k–\$2M)
* Valuation suggestions based on prior SAFE caps
* Example output like:

  > "At a \$6M pre and \$1M raised, you'd issue \~1.83M shares and dilute founders by 6%."

**Framework Alignment:**

* \#1 (Simplify)
* \#3 (Faster Aha Moment)
* \#5 (Outcome clarity)
* \#12 (UX focus)

---

### ✅ Issue 2: Save + Display Round Details Clearly

**Problem:** Claude’s answer disappears, and round data isn’t persistent.

**Solution:**

* Update the `funding_rounds` array in context or Supabase.
* Keep previous rounds in memory or DB.
* Add a visual recap list below the form (e.g., Round name, valuation, ownership %).

**Framework Alignment:**

* \#4 (Convince in onboarding)
* \#5 (Show outcomes)
* \#7 (User feels smarter)

---

### ✅ Issue 3: Improve AI Output Formatting

**Problem:** Explanation is crammed and not skimmable.

**Solution:**

* Break into bullet points with line breaks
* Use bolding for names and percentages
* Add emoji if in 12yo mode (🎯 📊 🔍)

**Framework Alignment:**

* \#3 (Faster Aha)
* \#8 (Remove UI friction)
* \#9 (Memorability)

---
### feature/mvp-sprint2

### ✅ Issue 4: Refresh Pie Chart Dynamically

**Problem:** Pie chart doesn’t reflect new round immediately.

**Solution:**

* Ensure chart rerenders after round submission
* Pull from latest `ownershipData`

**Framework Alignment:**

* \#5 (Show outcome)
* \#13 (Test with real users)

---

## New Issues

### Issue 5: Enhance AddFundingRound Wizard

**Problem:** The current funding round form could be more user-friendly with a guided, step-by-step approach.

**Solution:**
- Convert to a multi-step wizard
- Add progress indicator
- Include validation at each step
- Add a summary preview before submission

**Framework Alignment:**
- \#1 (Simplify)
- \#12 (UX focus)
- \#14 (Test as standalone)

### Issue 6: Mobile Responsiveness Audit

**Problem:** Some UI elements may not be optimized for mobile devices.

**Solution:**
- Audit all components for mobile responsiveness
- Fix any layout issues
- Ensure touch targets are appropriately sized
- Test on various device sizes

**Framework Alignment:**
- \#12 (UX focus)
- \#13 (Test with real users)

### Issue 7: Performance Testing

**Problem:** Application performance with large cap tables needs verification.

**Solution:**
- Test with large datasets (50+ funding rounds)
- Optimize rendering performance
- Implement virtualization for large lists
- Add loading states for expensive operations

**Framework Alignment:**
- \#5 (Show outcome)
- \#12 (UX focus)
- \#13 (Test with real users)
