# Git Setup in WSL - Step by Step

## The Issue

You're in WSL (Windows Subsystem for Linux) and git needs to be initialized in the WSL environment.

## Solution: Run These Commands in WSL

### Option 1: Use the Setup Script

```bash
# Make script executable
chmod +x git_setup_wsl.sh

# Run the script
./git_setup_wsl.sh
```

### Option 2: Manual Setup (Copy/Paste Each Command)

```bash
# 1. Navigate to project directory
cd /mnt/c/Users/Owner/Desktop/Santa\'s_workshop

# 2. Initialize git (if not already done)
git init

# 3. Check status
git status

# 4. Add remote repository
git remote add origin https://github.com/Mamasmess333/Santas_Workshop.git

# 5. Stage all files
git add .

# 6. Check what's staged
git status

# 7. Commit
git commit -m "Initial commit: Santa's Workshop Puzzle Game - Complete implementation"

# 8. Set branch name
git branch -M main

# 9. Push to GitHub
git push -u origin main
```

## If You Get Authentication Errors

WSL might need GitHub authentication. Options:

### Option A: Use Personal Access Token
```bash
# When prompted for password, use a GitHub Personal Access Token
# Create one at: https://github.com/settings/tokens
```

### Option B: Use SSH Keys
```bash
# Generate SSH key in WSL
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub SSH keys
cat ~/.ssh/id_ed25519.pub
# Copy and add to: https://github.com/settings/keys

# Change remote to SSH
git remote set-url origin git@github.com:Mamasmess333/Santas_Workshop.git
```

### Option C: Use Windows Git (Alternative)

If WSL gives you trouble, you can use Windows Git instead:

1. Open **PowerShell** (not WSL)
2. Navigate to: `C:\Users\Owner\Desktop\Santa's_workshop`
3. Run the git commands there

## Quick Fix: Use Windows Git Instead

If WSL is causing issues, switch to Windows:

1. **Open PowerShell** (press Win + X, select PowerShell)
2. **Navigate to project**:
   ```powershell
   cd "C:\Users\Owner\Desktop\Santa's_workshop"
   ```
3. **Run git commands**:
   ```powershell
   git init
   git remote add origin https://github.com/Mamasmess333/Santas_Workshop.git
   git add .
   git commit -m "Initial commit: Santa's Workshop Puzzle Game"
   git branch -M main
   git push -u origin main
   ```

## Common WSL Git Issues

### Issue: "fatal: not a git repository"
**Solution**: Make sure you're in the project directory and run `git init`

### Issue: Line ending warnings
**Solution**: Add to `.gitattributes`:
```
* text=auto
```

### Issue: Permission denied
**Solution**: Make sure you have write permissions to the directory

## Recommended: Use Windows Git

Since your project is in Windows (`C:\Users\Owner\Desktop\`), it's easier to use **Windows Git** rather than WSL git:

1. Open **PowerShell** or **Command Prompt**
2. Navigate to your project folder
3. Use git commands there

This avoids WSL/Windows filesystem permission issues!

