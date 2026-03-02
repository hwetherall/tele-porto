# Running Ralph on Windows (when you use WSL)

## Why `ralph` doesn’t work in PowerShell

You’re not doing anything wrong. You have **two separate environments**:

| Environment | Shell | Where Ralph lives |
|-------------|--------|--------------------|
| **Windows** | PowerShell, Command Prompt | Ralph is **not** here — Windows doesn’t see Linux programs |
| **WSL (Linux)** | Bash inside WSL | Ralph **is** here — you installed it with `./install.sh` in WSL |

When you installed Ralph on your “Linux” setup, that was **inside WSL**. So Ralph was added to the **Linux** PATH and to the Linux home directory (e.g. `~/.ralph` and `~/.local/bin` in WSL).

PowerShell is a **Windows** shell. It only sees Windows PATH and Windows programs. So in PowerShell, `ralph` is “not recognized” because, to Windows, Ralph doesn’t exist — it only exists inside WSL.

So: **it’s not because the app was “created in Windows”.** It’s because Ralph is installed in WSL, and you need to run it from WSL, not from PowerShell.

---

## What to do: run Ralph from WSL

Use the same workflow as on a normal Linux machine, but start from WSL.

### 1. Open WSL

- In PowerShell or Command Prompt, type: `wsl`  
  **or**
- From the Start menu, open your WSL distro (e.g. “Ubuntu”).

You’re now in a Linux shell (bash) inside WSL.

### 2. Go to your Tele-Porto project

Your project is on the Windows drive. In WSL, Windows `C:\` is under `/mnt/c/`:

```bash
cd /mnt/c/Users/hweth/OneDrive/Desktop/Tele-Porto
```

(If your Windows user name or path is different, adjust: `C:\Users\YourName\...` → `/mnt/c/Users/YourName/...`.)

### 3. Run Ralph

```bash
ralph --monitor
```

Because you’re now in the same (Linux) environment where Ralph is installed, the `ralph` command will be found and will use the `.ralph/` folder in this project.

---

## Quick reference

- **Ralph works in:** WSL (Linux) — where you ran `./install.sh`.
- **Ralph does not work in:** PowerShell or CMD — they don’t see WSL’s PATH.
- **Your app (Tele-Porto)** can be on the Windows disk; WSL can use it via `/mnt/c/...`.
- So: open WSL → `cd` to the project (via `/mnt/c/...`) → run `ralph --monitor`.

If you want, we can add a small script you can run from PowerShell that opens WSL, goes to this project, and runs `ralph --monitor` for you so you don’t have to remember the path.
