## 🧠 Local Development Rules

# 🧠 SliceWise Dev Standards (AI-Native, Claude-Compatible)

A right-sized developer standards doc optimized for AI-native, solo/paired coding inside SliceWise.
Built from Semantic Seed Venture Studio Standards, adapted for Claude Sonnet 4 + MCP + Windsurf + Bolt flows.

---

## 🗂️ Backlog Management

We follow a GitHub-first workflow with issues managed via `backlog.json`, MCP, and Claude-driven planning.

### Branching & Git Flow

* `feature/{name}` — new features
* `bug/{name}` — bug fixes
* `refactor/{name}` — internal rework
* **Always WIP commit daily** with meaningful messages

### Claude Prompts

* **Prompt:** *"Given a backlog item, rewrite it with clear value, effort, and problem solved."*
* **Prompt:** *"Given this task, suggest ideal commit message and PR title."*

---

## 🧪 Testing Strategy (TDD / BDD Lite)

### Basics (for MVP Stage)

* Use Jest or Claude-generated test blocks
* Focus on **core logic**: dilution calc, SAFE logic, equity table outputs
* Stub tests for UI or visuals unless regression occurs

### Claude Prompts

* **Prompt:** *"Write BDD-style unit tests for this equity split logic."*
* **Prompt:** *"Simulate integration test between SAFE converter and exit simulator."*

---

## 🧠 AI Prompts & Copilot Patterns

Every major feature is paired with:

* Claude prompt (e.g. "Explain this round like I’m 12")
* Tone toggle: 12yo | Mentor | Expert

Keep prompts:

* In `/prompts/` folder OR inline in issue
* Referenced in commit messages when used

---

## 🎨 Coding Style

### JS/TS + React

* **camelCase** for vars & funcs
* **PascalCase** for components
* Max line: **80–100 chars**
* 2-space indent (match Prettier default)

### Claude Prompt

* **Prompt:** *"Reformat this TSX file using best React + Tailwind practices."*

---

## 🚀 Claude-First CI/CD Readiness

Not enforced yet, but plan for:

* `main` → auto-deploy to staging (Vercel/Netlify)
* `feature/*` → PR reviewed + auto-preview
* GitHub Actions or Claude-generated CI pipeline

---

## 📦 Task Estimation (Solo Builder Mode)

Effort tiers:

* ✅ **XS (0)** – One-line fix
* ✅ **S (1)** – Trivial state/logic
* ✅ **M (2)** – Small UI + logic (1 hour)
* ✅ **L (3-5)** – Multi-component feature (1–3 hrs)
* 🚫 **XL (8+)** – Split into smaller stories

---

## 🔁 Feature Workflow

1. ✅ MCP issue created from Claude prompt
2. ✅ Start new branch: `feature/my-feature`
3. ✅ Claude implements core + test
4. ✅ Push, PR, human or Claude review
5. ✅ Merge to `main`, test live
6. 🔁 Re-run on user feedback

---

## 📚 Included Claude Prompts Library (Mini)

* *"Explain cap table like I’m 12"*
* *"Summarize dilution from SAFE at \$5M cap"*
* *"Generate post-money equity breakdown"*
* *"Write Jest tests for this funding round calc"*

---

## ✅ Principle Summary (AI Native Build Philosophy)

* Build to reduce **time-to-aha** to seconds
* Claude is your dev + PM + tutor
* MVP should answer **1 clear question** well
* Test with real humans after each push
* Simplify, don’t scale too early


##This project uses a local rule system based on AI-native DevStandards:

- PRs must follow `feature/xxx`, `bug/xxx`, or `chore/xxx` format.
- Commit daily. Use WIP commits when unsure.
- All work must reference a user story in `backlog.json`.
