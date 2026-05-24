# 🛡️ GitHub Flow & Branch Protections Guide

This document defines the version control, branching strategy, and pull request workflow for the **focused-hertz** development team.

---

## 🌊 Branching Strategy: Namespaced GitHub Flow

We adhere to a clean, namespaced branching convention derived from standard GitHub Flow. Direct commits to the `main` branch are strictly prohibited. All developers and subagents must work on isolated feature branches.

### 📌 Namespace Conventions

All branches must be prefixed with a standard category namespace followed by a descriptive kebab-case identifier:

| Namespace | Category / Owner | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `feat/` | Feature | New business logic, UI components, or routes | `feat/slums-juice-currency` |
| `fix/` | Bug Fix | Resolution of errors, typos, state-desyncs, or lints | `fix/game-state-loop-crash` |
| `infra/` | Infrastructure | DevOps scripts, build tools, Vite configs, terraform | `infra/manual-chunk-splitting` |
| `docs/` | Documentation | README updates, system design writeups, manuals | `docs/branch-protections-guide` |
| `test/` | Testing | Unit tests, mock databases, E2E browser test cases | `test/game-context-vitest` |
| `security/` | Security | Hardening security rules, cryptographic configurations | `security/firestore-role-hardening` |

---

## 🛡️ GitHub Branch Protections for `main`

To enforce maximum stability and maintain a continuous deployment-ready `main` branch, the following rules are active and must be configured in GitHub repository settings:

### 1. Require Pull Requests Before Merging
- All changes must be proposed through a pull request (PR).
- No direct pushes are allowed.

### 2. Required Approvals & Code Reviews
- At least **one code review approval** is required from an authorized lead or gatekeeper.
- **Agent Smith** (Code Quality Police) must inspect the PR for stylistic compliance, anti-patterns, and linting rules.
- **Niobe** (Security Architect) must approve any changes to Firebase security configurations (`firestore.rules`) or auth hooks.

### 3. Required Status Checks (CI Pipeline)
Before a PR can be merged into `main`, the automated build checks must pass cleanly. This includes:
- **Linter Check (`npm run lint`)**: Ensure zero lint errors.
- **Test Suite (`npm run test`)**: Ensure all Vitest tests pass cleanly.
- **Vite Compilation Check (`npm run build`)**: Verify compilation integrity with zero bundler errors.

### 4. Require Linear History
- Avoid merge commits. All PRs should be merged using **Squash and Merge** or **Rebase and Merge** to maintain a clean, flat git commit log.

---

## 🛠️ Developer Checklist for Merging to `main`

Before submitting a PR for review:
1. Ensure your local branch is synchronized with origin: `git pull --rebase origin main`
2. Run local code quality gatechecks:
   - Compile code: `npm run build`
   - Lint code: `npm run lint`
   - Test code: `npm run test`
3. Push to your branch: `git push origin <your-branch-name>`
4. Open a Pull Request referencing the corresponding user story card.
