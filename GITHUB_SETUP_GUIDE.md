# GitHub Repository Setup Guide

## Overview

This guide explains how to set up a GitHub repository for FIRE Sentinel and push your code to GitHub.

## Prerequisites

- GitHub account (sign up at https://github.com if you don't have one)
- Git installed on your Mac (see MAC_INSTALLATION_GUIDE.md)
- Personal Access Token (PAT) from GitHub

## Step 1: Create a Personal Access Token (PAT)

GitHub requires a Personal Access Token for authentication when pushing code.

### Generate PAT

1. Log in to GitHub (https://github.com)
2. Click your profile picture (top right) → **Settings**
3. Scroll down and click **Developer settings** (bottom left)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Configure the token:
   - **Note**: "FIRE Sentinel Repository Access"
   - **Expiration**: 90 days (or custom)
   - **Select scopes**:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
7. Click **Generate token**
8. **IMPORTANT**: Copy the token immediately (you won't see it again!)
9. Save it securely (e.g., in your password manager)

### Token Format

Your token will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Create GitHub Repository

### Option A: Create New Repository on GitHub

1. Go to https://github.com/new
2. Fill in repository details:
   - **Repository name**: `fire-sentinel` (or your preferred name)
   - **Description**: "Portfolio monitoring application with real-time price tracking and alerts"
   - **Visibility**: 
     - **Private** (recommended for personal use)
     - **Public** (if you want to share with others)
   - **Initialize repository**: 
     - ❌ Do NOT check "Add a README file"
     - ❌ Do NOT add .gitignore
     - ❌ Do NOT choose a license
3. Click **Create repository**
4. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/fire-sentinel.git`)

### Option B: Use Existing Repository

If you already have a repository, just copy its URL.

## Step 3: Initialize Local Git Repository

Open Terminal and navigate to your project directory:

```bash
cd /workspace/app-bknmhki4hhq9  # or your project path
```

### Initialize Git (if not already initialized)

```bash
# Check if Git is already initialized
git status

# If not initialized, run:
git init
```

### Configure Git User (first time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 4: Add Remote Repository

Link your local repository to GitHub:

```bash
# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/fire-sentinel.git

# Verify remote was added
git remote -v
```

## Step 5: Prepare Files for Commit

### Check Current Status

```bash
git status
```

### Add Files to Staging

```bash
# Add all files
git add .

# Or add specific files
git add src/
git add public/
git add package.json
git add README.md
```

### Verify Staged Files

```bash
git status
```

**Important**: Ensure `.env` is NOT in the staged files (it should be ignored by .gitignore)

## Step 6: Create Initial Commit

```bash
git commit -m "Initial commit: FIRE Sentinel portfolio monitoring application

- React + TypeScript + Vite frontend
- Supabase backend with PostgreSQL
- Real-time price monitoring with Alpha Vantage/Yahoo Finance
- Custom price alerts with directional triggers
- AI-powered news sentiment analysis
- Multi-channel alert delivery (Email/Slack/SMS)
- Portfolio management with multi-account support
- Comprehensive documentation"
```

## Step 7: Push to GitHub

### Using Personal Access Token

When pushing, Git will ask for your username and password. Use your PAT as the password.

```bash
# Push to main branch
git push -u origin main
```

**Authentication Prompt**:
```
Username for 'https://github.com': YOUR_GITHUB_USERNAME
Password for 'https://YOUR_GITHUB_USERNAME@github.com': YOUR_PERSONAL_ACCESS_TOKEN
```

**Note**: Paste your PAT (not your GitHub password) when prompted for password.

### Store Credentials (Optional)

To avoid entering credentials every time:

```bash
# Store credentials in macOS Keychain
git config --global credential.helper osxkeychain

# Next time you push, credentials will be saved automatically
```

## Step 8: Verify on GitHub

1. Go to your repository URL: `https://github.com/YOUR_USERNAME/fire-sentinel`
2. Verify all files are present
3. Check that `.env` is NOT visible (should be ignored)
4. Review the README.md

## Using the PAT Token You Provided

If you've shared your PAT token with me, I can help push the code directly. Here's what I'll do:

### Automated Push Process

```bash
# Navigate to project
cd /workspace/app-bknmhki4hhq9

# Configure Git
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Initialize and add remote
git init
git remote add origin https://YOUR_PAT_TOKEN@github.com/YOUR_USERNAME/fire-sentinel.git

# Add all files
git add .

# Create commit
git commit -m "Initial commit: FIRE Sentinel v3 with custom price alerts"

# Push to GitHub
git push -u origin main
```

## Repository Structure

After pushing, your GitHub repository will contain:

```
fire-sentinel/
├── .gitignore                          # Git ignore rules
├── .env.example                        # Environment template
├── README.md                           # Main documentation
├── MAC_INSTALLATION_GUIDE.md           # Mac installation guide
├── QUICK_START_MAC.md                  # Quick start guide
├── API_CONFIGURATION_GUIDE.md          # API setup guide
├── CUSTOM_PRICE_ALERTS_GUIDE.md        # Price alerts guide
├── CUSTOM_PRICE_ALERTS_IMPLEMENTATION.md
├── EDGE_FUNCTIONS.md                   # Edge Functions docs
├── CHANGELOG.md                        # Version history
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite config
├── tailwind.config.js                  # Tailwind config
├── index.html                          # Entry point
├── src/                                # Source code
│   ├── main.tsx                        # App entry
│   ├── App.tsx                         # Root component
│   ├── index.css                       # Global styles
│   ├── routes.tsx                      # Route definitions
│   ├── components/                     # React components
│   ├── pages/                          # Page components
│   ├── services/                       # API services
│   ├── types/                          # TypeScript types
│   └── db/                             # Database config
├── public/                             # Static assets
└── supabase/                           # Supabase config
    ├── functions/                      # Edge Functions
    └── migrations/                     # Database migrations
```

## Updating the Repository

### After Making Changes

```bash
# Check what changed
git status

# Add changed files
git add .

# Commit with descriptive message
git commit -m "Add feature: description of changes"

# Push to GitHub
git push
```

### Pull Latest Changes

If working from multiple computers:

```bash
# Get latest changes from GitHub
git pull origin main
```

## Branch Strategy

### Main Branch

- `main`: Production-ready code
- All commits should be tested and working

### Feature Branches (Optional)

For larger changes:

```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push -u origin feature/new-feature-name

# Merge to main (after testing)
git checkout main
git merge feature/new-feature-name
git push
```

## Security Best Practices

### Never Commit Sensitive Data

**Never commit**:
- `.env` file (contains Supabase credentials)
- API keys
- Passwords
- Personal data
- Database dumps with real data

**Always commit**:
- `.env.example` (template without real values)
- Source code
- Documentation
- Configuration files (without secrets)

### If You Accidentally Commit Secrets

1. **Immediately rotate all exposed credentials**:
   - Generate new Supabase keys
   - Generate new API keys
   - Update `.env` file locally

2. **Remove from Git history**:
```bash
# Remove file from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: rewrites history)
git push origin --force --all
```

3. **Better approach**: Delete repository and create new one with clean history

## Collaboration

### Adding Collaborators

If you want others to contribute:

1. Go to repository on GitHub
2. Click **Settings** → **Collaborators**
3. Click **Add people**
4. Enter GitHub username or email
5. Select permission level:
   - **Read**: View only
   - **Write**: Can push changes
   - **Admin**: Full control

### Protecting Main Branch

To prevent accidental changes:

1. Go to repository **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass
5. Click **Create**

## Troubleshooting

### Authentication Failed

**Error**: `Authentication failed`

**Solution**:
- Verify PAT is correct
- Check PAT hasn't expired
- Ensure PAT has `repo` scope
- Try clearing credentials:
```bash
git credential-osxkeychain erase
host=github.com
protocol=https
```

### Remote Already Exists

**Error**: `remote origin already exists`

**Solution**:
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/fire-sentinel.git
```

### Push Rejected

**Error**: `Updates were rejected because the remote contains work that you do not have locally`

**Solution**:
```bash
# Pull changes first
git pull origin main --rebase

# Then push
git push origin main
```

### Large Files

**Error**: `file is too large` (files > 100MB)

**Solution**:
- Don't commit large files (videos, databases, etc.)
- Add to `.gitignore`
- Use Git LFS for large files (if needed)

## GitHub Features

### GitHub Actions (CI/CD)

Automate testing and deployment:

1. Create `.github/workflows/ci.yml`
2. Define workflow (build, test, deploy)
3. Runs automatically on push/pull request

### GitHub Pages

Host documentation:

1. Go to repository **Settings** → **Pages**
2. Select source: `main` branch, `/docs` folder
3. Documentation will be available at: `https://YOUR_USERNAME.github.io/fire-sentinel/`

### Issues and Projects

Track bugs and features:

1. Go to **Issues** tab
2. Click **New issue**
3. Describe bug or feature request
4. Assign labels, milestones, assignees

## Next Steps

After setting up GitHub:

1. ✅ Verify all files are pushed
2. ✅ Check `.env` is not visible
3. ✅ Update README.md with your repository URL
4. ✅ Add repository description and topics
5. ✅ Star your repository (for easy access)
6. ✅ Share repository URL with collaborators (if any)

## Useful Git Commands

```bash
# View commit history
git log --oneline

# View changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View remote URL
git remote -v

# Change remote URL
git remote set-url origin NEW_URL

# Create tag
git tag -a v1.0 -m "Version 1.0"
git push origin v1.0

# View all branches
git branch -a

# Delete branch
git branch -d branch-name
```

## Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub Docs**: https://docs.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **GitHub Desktop** (GUI alternative): https://desktop.github.com/

## Conclusion

Your FIRE Sentinel code is now safely stored on GitHub! You can access it from anywhere, collaborate with others, and track changes over time.

Remember to:
- Commit regularly with descriptive messages
- Never commit sensitive data
- Pull before pushing when working from multiple locations
- Keep your PAT secure and rotate it periodically
