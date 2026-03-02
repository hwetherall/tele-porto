# Ralph configuration — Tele-Porto

This folder follows the [Ralph for Claude Code](https://github.com/frankbria/ralph-claude-code) v0.10+ layout. Ralph uses these files when running autonomous development loops.

| File | Purpose |
|------|--------|
| `PROMPT.md` | Main instructions and context for Claude Code |
| `fix_plan.md` | Prioritised task list; complete in order, mark with [x] when done |
| `AGENT.md` | Build, run, and verification commands |
| `specs/` | Technical requirements and conventions |
| `specs/stdlib/` | Reusable coding standards |
| `logs/` | Ralph execution logs (when using Ralph CLI) |

Project-level config: `.ralphrc` at repo root (tool permissions, timeouts, session).

High-level product brief: `CLAUDE.md` at repo root.

---

## Running Ralph on Windows (PowerShell)

Ralph’s `install.sh` adds the `ralph` command to Bash (e.g. Git Bash), not to PowerShell.

**Option 1 — From PowerShell (this repo):**
```powershell
.\run-ralph.ps1 --monitor
```
Requires Git Bash and Ralph installed (see run-ralph.ps1 if it says “Ralph not found”).

**Option 2 — From Git Bash:**  
Open Git Bash, `cd` to this project folder, then run:
```bash
ralph --monitor
```
Make sure `~/.local/bin` is in your PATH (install.sh tells you to add it to `~/.bashrc`).
