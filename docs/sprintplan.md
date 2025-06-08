# ⏱️ SliceWise – 5-Hour MVP Sprint Plan

## Goal
Deliver a working, ELI5-first cap table tool that uses Claude Sonnet 4 to explain key concepts while simulating equity events.

---

## 🕐 Hour 1: Clean UI Setup
- [ ] Refactor frontend folder
- [ ] Add Hero + CTA + 3-step walkthrough
- [ ] Commit `feat: hero layout`

## 🕐 Hour 2: Equity + SAFE Input
- [ ] Implement form for founders
- [ ] Add SAFE input block
- [ ] Normalize share logic

## 🕐 Hour 3: Visualization
- [ ] Create live pie chart
- [ ] Show cap table below inputs
- [ ] Highlight new investors

## 🕐 Hour 4: AI Copilot Integration
- [ ] Hook up to Claude Sonnet 4 via OpenRouter
- [ ] Inject cap table JSON + prompt
- [ ] Show replies with markdown formatting

## 🕐 Hour 5: Learn Mode + Export
- [ ] Add sticky Learn Sidebar
- [ ] Add tooltips on finance terms
- [ ] Add export (optional) + sample loader
# 🏃‍♂️ SliceWise Sprint Plan (MVP – Sprint 2)

## ⏳ Duration

**2 Days (or 5–6 focused hours)**

## 🎯 Sprint Goal

Build and ship 3 features that drive clarity, reduce confusion, and speed up onboarding for equity beginners.

---

## 📦 Features in Scope

### ✅ 1. Smart Sample Scenario with Guided Onboarding

* Load realistic cap table (2 founders, SAFE, ESOP, Seed)
* Trigger Claude Copilot to explain the setup
* Ensure it's editable and sharable

### ✅ 2. Explain My Funding Round (AI Copilot Upgrade)

* Claude reacts to new round added
* Summarizes ownership change and SAFE conversion
* ELI5 tone with clarity on valuation, dilution, new shares

### ✅ 3. Add Funding Round Wizard

* Step-by-step UX instead of a single overwhelming form
* Capture round type → amount → valuation → preview → confirm
* Final Claude summary upon confirmation

---

## 🛠️ Hour-by-Hour Breakdown

### 🔹 Hour 1: Setup & Sample Scenario

* Implement "Load Sample" button and data
* Hook into cap table state
* Add Claude call to explain setup

### 🔹 Hour 2: Funding Wizard UI

* Create multi-step form
* Validate transitions and inputs
* Integrate with existing cap table logic

### 🔹 Hour 3: Explain My Round Logic

* Trigger Claude when round added
* Inject cap table context + round info
* Format reply in Copilot pane

### 🔹 Hour 4: Polish UX & Testing

* Confirm flow for all 3 features
* Style sample scenario UI
* Test edge cases (e.g., empty cap table, bad inputs)

### 🔹 Hour 5: Commit + Deploy + Record

* Push working version to GitHub
* Record Loom walkthrough or screenshots
* Log open issues for polish or bugs

---

## 🔚 Done Criteria

* ✅ All 3 features functional and visually clear
* ✅ Claude explains each key action
* ✅ GitHub in sync with local state
* ✅ Product link shareable for demo/testing
