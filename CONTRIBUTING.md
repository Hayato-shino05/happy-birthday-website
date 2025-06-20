# Contributing to **Happy-Birthday-Website**

Thanks for your interest in improving this open-source project! We welcome pull-requests and issues.

## 📑 Prerequisites
1. Node ≥ 18 & npm ≥ 9 (or pnpm/bun).
2. Supabase account (optional) for running the API locally.
3. Fork & clone the repository.

```bash
git clone https://github.com/<your-user>/happy-birthday-website.git
cd happy-birthday-website
npm install
cp env.example .env.local   # add your Supabase creds
```

## 🌳 Branch & Commit
| Purpose | Branch prefix | Example |
|---------|---------------|---------|
| New feature | `feat/` | `feat/album-upload` |
| Bug fix | `fix/` | `fix/chat-scroll` |
| Documentation | `docs/` | `docs/database` |
| Chore | `chore/` | `chore/ci-node-20` |

Commits follow Conventional Commits (e.g. `feat(album): add tag filter`). This enables automatic changelog.

## 🧹 Coding style
* **ESLint + Prettier + Tailwind CSS order** are enforced. Run:
  ```bash
  npm run lint
  ```
* All code is TypeScript (strict mode gradually enabled).
* Prefer functional components & hooks. Store transient UI state in local hook, global state in **Zustand**.

## 🧪 Tests
Unit tests use **Vitest + @testing-library/react**.
```bash
npm run test
```
Add at least one test for every new component or hook.

## 🏗️ Running locally
```bash
npm run dev
```
Visit http://localhost:3000.

Supabase functions (realtime chat, storage) will fall back to public endpoints when no service-role key is provided.

## 🔄 Pull Request Checklist
- [ ] Lint passes (`npm run lint`).
- [ ] Unit tests added/updated; `npm run test` green.
- [ ] If UI changes: add screenshot/GIF in PR description.
- [ ] Update documentation (`README.md`, `docs/*`) when necessary.

## 📜 License
By contributing you agree your work will be released under the MIT license of the project.
