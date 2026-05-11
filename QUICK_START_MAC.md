# Quick Start Guide - Mac

## TL;DR - Get Running in 5 Minutes

### Prerequisites
- Mac with macOS 10.15 or later
- Internet connection

### Installation Commands

Open Terminal (Applications > Utilities > Terminal) and run these commands:

```bash
# 1. Install Homebrew (if needed) - paste this entire line
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node

# 3. Navigate to where you want to install (e.g., Documents folder)
cd ~/Documents

# 4. Clone repository
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel

# 5. Install dependencies (this takes 2-3 minutes)
npm install

# 6. Create environment file
cp .env.example .env

# 7. Edit .env file with your Supabase credentials
open -e .env
```

### Configure .env File

When the text editor opens, replace these values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to get these**:
1. Go to https://app.supabase.com/
2. Select your project
3. Click Settings > API
4. Copy "Project URL" and "anon public" key

Save and close the file.

### Start the Application

```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

### Access the App

Open your browser to: **http://localhost:5173**

### First-Time Setup (In the App)

1. **Settings Page**:
   - Add Alpha Vantage API key (get free at https://www.alphavantage.co/support/#api-key)
   - Configure monitoring frequencies
   - Set up alert delivery (optional)

2. **Portfolio Management Page**:
   - Click "Add Account" → Enter account name
   - Click "Add Stock" → Enter symbol, quantity, bought price

3. **Dashboard**:
   - Click "Refresh Prices" to update stock prices
   - View your portfolio summary

Done! 🎉

## Daily Usage

### Start the App
```bash
cd ~/Documents/fire-sentinel
npm run dev
```

Open browser to: http://localhost:5173

### Stop the App
Press `Ctrl + C` in Terminal

## Common Issues & Quick Fixes

### "Port 5173 is already in use"
```bash
kill -9 $(lsof -ti:5173)
npm run dev
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Failed to connect to Supabase"
- Check `.env` file has correct URL and key
- Verify Supabase project is active at https://app.supabase.com/
- Check internet connection

### "Command not found: npm"
```bash
brew install node
```

### "Command not found: brew"
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Need More Help?

- **Detailed Guide**: See [MAC_INSTALLATION_GUIDE.md](MAC_INSTALLATION_GUIDE.md)
- **API Setup**: See [API_CONFIGURATION_GUIDE.md](API_CONFIGURATION_GUIDE.md)
- **GitHub Setup**: See [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md)

## Tips

- **Bookmark** http://localhost:5173 in your browser
- **Keep Terminal open** while using the app
- **Update regularly**: `git pull && npm install`
- **Check logs** in Terminal if something doesn't work

## What's Next?

After setup:
1. ✅ Add your brokerage accounts
2. ✅ Add stocks to track
3. ✅ Set custom price alerts
4. ✅ Configure alert delivery
5. ✅ Monitor your portfolio daily

Happy investing! 📈

