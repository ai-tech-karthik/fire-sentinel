# FIRE Sentinel - Mac Installation Guide

## Overview

This guide will walk you through installing and running FIRE Sentinel on your Mac computer. The application is a web-based portfolio monitoring tool built with React, TypeScript, and Supabase.

## Prerequisites

Before you begin, ensure your Mac meets these requirements:
- **macOS**: 10.15 (Catalina) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB free space
- **Internet Connection**: Required for API access and real-time data

## Installation Steps

### Step 1: Install Homebrew (if not already installed)

Homebrew is a package manager for Mac that makes installing software easy.

1. Open **Terminal** (Applications > Utilities > Terminal)
2. Run this command:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
3. Follow the on-screen instructions
4. Verify installation:
```bash
brew --version
```

### Step 2: Install Node.js and npm

Node.js is required to run the application.

1. Install Node.js using Homebrew:
```bash
brew install node
```

2. Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

**Alternative**: Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)

### Step 3: Install Git (if not already installed)

Git is needed to clone the repository.

1. Check if Git is installed:
```bash
git --version
```

2. If not installed, install via Homebrew:
```bash
brew install git
```

3. Configure Git (first time only):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 4: Clone the Repository

1. Open Terminal and navigate to where you want to install the app:
```bash
cd ~/Documents  # or any directory you prefer
```

2. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/fire-sentinel.git
cd fire-sentinel
```

**Note**: Replace `YOUR_USERNAME/fire-sentinel` with your actual GitHub repository path.

### Step 5: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This may take 2-5 minutes depending on your internet connection.

### Step 6: Set Up Supabase

FIRE Sentinel uses Supabase for backend services. You have two options:

#### Option A: Use Existing Supabase Project (Recommended)

If the app was already deployed with Supabase:

1. Create a `.env` file in the project root:
```bash
touch .env
```

2. Open the `.env` file in a text editor:
```bash
open -e .env
```

3. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these values**:
- Log in to [Supabase Dashboard](https://app.supabase.com/)
- Select your project
- Go to Settings > API
- Copy "Project URL" and "anon public" key

#### Option B: Create New Supabase Project

If starting fresh:

1. Go to [supabase.com](https://supabase.com/) and sign up
2. Create a new project
3. Wait for project initialization (2-3 minutes)
4. Run database migrations (see Database Setup section below)
5. Add credentials to `.env` file as shown above

### Step 7: Configure API Keys

1. Open the application (see Step 8)
2. Navigate to **Settings** page
3. Configure your API keys:

**Alpha Vantage** (Required for stock prices):
- Get free API key: https://www.alphavantage.co/support/#api-key
- Enter in Settings > API Configuration > Alpha Vantage API Key

**Gen AI Services** (Optional for enhanced sentiment analysis):
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google Gemini**: https://makersuite.google.com/app/apikey
- Select platform and enter key in Settings

**Alert Delivery** (Optional):
- Configure Email, Slack webhook, or SMS in Settings > Alert Delivery

### Step 8: Run the Application

Start the development server:

```bash
npm run dev
```

You should see output like:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 9: Access the Application

1. Open your web browser (Chrome, Safari, Firefox, or Edge)
2. Navigate to: `http://localhost:5173`
3. The FIRE Sentinel dashboard should load

**Bookmark this URL** for easy access in the future.

## Database Setup (For New Supabase Projects)

If you created a new Supabase project, you need to set up the database schema:

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **SQL Editor**
4. Run the migration files in order:

**File locations** (in your project):
- `supabase/migrations/` directory contains all SQL files
- Run them in chronological order (sorted by filename)

**To run**:
- Copy contents of each `.sql` file
- Paste into SQL Editor
- Click "Run"
- Verify success message

### Option 2: Using Supabase CLI

1. Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

3. Push migrations:
```bash
supabase db push
```

## First-Time Setup

After installation, follow these steps to set up your portfolio:

### 1. Configure Settings
- Go to **Settings** page
- Add Alpha Vantage API key (required)
- Configure monitoring frequencies (default: 5 min for prices, 10 min for news)
- Set up alert delivery channels (email/Slack/SMS)

### 2. Add Accounts
- Go to **Portfolio Management** page
- Click "Add Account"
- Enter account name (e.g., "Fidelity Brokerage")
- Add optional description

### 3. Add Stocks
- In Portfolio Management, click "Add Stock"
- Select account
- Enter stock symbol (e.g., AAPL, TSLA)
- Enter quantity and bought price
- Set profit target % and stop loss %
- Click "Add"

### 4. Set Custom Price Alerts (Optional)
- In Portfolio Management, click chevron (>) next to any stock
- Click "Add Alert"
- Enter target price and direction (above/below)
- Add optional note
- Click "Create"

### 5. Monitor Your Portfolio
- Go to **Dashboard** to view portfolio summary
- Click "Refresh Prices" to update stock prices
- View recent alerts and news

## Running the Application

### Starting the App

Every time you want to use FIRE Sentinel:

1. Open Terminal
2. Navigate to project directory:
```bash
cd ~/Documents/fire-sentinel  # or your installation path
```
3. Start the server:
```bash
npm run dev
```
4. Open browser to `http://localhost:5173`

### Stopping the App

To stop the application:
- In Terminal, press `Ctrl + C`
- Or close the Terminal window

**Note**: The app only runs when the development server is active. Closing the browser tab does NOT stop the server.

## Keeping the App Running

### Option 1: Keep Terminal Open
- Leave Terminal window open while using the app
- Minimize Terminal to keep it out of the way

### Option 2: Run in Background
```bash
npm run dev > /dev/null 2>&1 &
```

To stop background process:
```bash
pkill -f "vite"
```

### Option 3: Use Screen/Tmux (Advanced)
```bash
# Install tmux
brew install tmux

# Start tmux session
tmux new -s fire-sentinel

# Run app
npm run dev

# Detach: Press Ctrl+B, then D
# Reattach: tmux attach -t fire-sentinel
```

## Updating the Application

To get the latest updates:

1. Stop the application (Ctrl + C)
2. Pull latest changes:
```bash
git pull origin main
```
3. Update dependencies:
```bash
npm install
```
4. Restart the application:
```bash
npm run dev
```

## Troubleshooting

### Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Find process using port 5173
lsof -ti:5173

# Kill the process
kill -9 $(lsof -ti:5173)

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found Errors

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues

**Error**: `Failed to connect to Supabase`

**Solution**:
1. Check `.env` file exists and has correct credentials
2. Verify Supabase project is active (not paused)
3. Check internet connection
4. Restart the application

### API Key Issues

**Error**: `Invalid API key` or `Rate limit exceeded`

**Solution**:
1. Verify API key is correct in Settings
2. Check API provider dashboard for status
3. For Alpha Vantage: Free tier has 5 calls/min, 500 calls/day limit
4. Wait for rate limit to reset or upgrade plan

### Build Errors

**Error**: Build or compilation errors

**Solution**:
```bash
# Clear cache and rebuild
rm -rf node_modules .vite package-lock.json
npm install
npm run dev
```

### Permission Denied

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

## Performance Tips

### Optimize for Mac

1. **Close Unused Apps**: Free up RAM by closing unnecessary applications
2. **Use Safari**: Safari is optimized for Mac and uses less battery
3. **Adjust Monitoring Frequency**: Longer intervals = less CPU/network usage
4. **Limit Stock Count**: Fewer stocks = faster updates

### Battery Saving

When running on battery:
1. Increase monitoring frequencies (e.g., 10 min for prices, 30 min for news)
2. Disable Gen AI sentiment analysis (uses more resources)
3. Use Safari instead of Chrome (better battery efficiency)

## Security Best Practices

### Protect Your API Keys

1. **Never commit `.env` file** to Git
2. **Use different keys** for development and production
3. **Rotate keys regularly** (every 3-6 months)
4. **Monitor API usage** for unauthorized access

### Secure Your Mac

1. **Enable FileVault**: System Preferences > Security & Privacy > FileVault
2. **Use strong password**: For your Mac user account
3. **Keep macOS updated**: Install security updates promptly
4. **Use firewall**: System Preferences > Security & Privacy > Firewall

## Backup and Data

### Where Data is Stored

- **Portfolio Data**: Supabase database (cloud)
- **Settings**: Supabase database (cloud)
- **API Keys**: Supabase database (cloud)
- **Local Files**: Only application code, no user data

### Backup Strategy

Since all data is in Supabase:
1. **Automatic Backups**: Supabase backs up daily (Pro plan)
2. **Manual Export**: Use CSV export feature in Portfolio Management
3. **Database Dump**: Use Supabase Dashboard > Database > Backups

## Uninstalling

To completely remove FIRE Sentinel:

1. Stop the application (Ctrl + C)
2. Remove project directory:
```bash
rm -rf ~/Documents/fire-sentinel  # or your installation path
```
3. (Optional) Remove Node.js:
```bash
brew uninstall node
```
4. (Optional) Delete Supabase project:
   - Log in to Supabase Dashboard
   - Select project
   - Settings > General > Delete Project

## Getting Help

### Documentation

- **README.md**: General overview and features
- **API_CONFIGURATION_GUIDE.md**: Detailed API setup instructions
- **CUSTOM_PRICE_ALERTS_GUIDE.md**: Guide for custom price alerts
- **EDGE_FUNCTIONS.md**: Technical documentation for Edge Functions

### Support Resources

1. **Check Documentation**: Review guides in the project directory
2. **GitHub Issues**: Report bugs or request features
3. **Supabase Docs**: https://supabase.com/docs
4. **API Provider Docs**:
   - Alpha Vantage: https://www.alphavantage.co/documentation/
   - OpenAI: https://platform.openai.com/docs
   - Anthropic: https://docs.anthropic.com/

### Common Questions

**Q: Can I run this on multiple Macs?**
A: Yes, clone the repository on each Mac and use the same Supabase credentials.

**Q: Does this work offline?**
A: No, internet connection is required for real-time data and alerts.

**Q: Can I access this from my iPhone?**
A: Yes, if both devices are on the same network, use your Mac's IP address (e.g., `http://192.168.1.100:5173`). To find your IP: System Preferences > Network.

**Q: Is my data secure?**
A: Yes, data is stored in Supabase with industry-standard security. API keys are never exposed to the browser.

**Q: Can I run this 24/7?**
A: Yes, but you'll need to keep your Mac running. Consider using a cloud deployment for 24/7 monitoring.

## Advanced Configuration

### Custom Port

To run on a different port:
```bash
npm run dev -- --port 3000
```

### Network Access

To access from other devices on your network:
```bash
npm run dev -- --host
```

Then access via: `http://YOUR_MAC_IP:5173`

### Production Build

For better performance:
```bash
npm run build
npm run preview
```

## System Requirements Summary

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| macOS | 10.15 Catalina | 12.0 Monterey or later |
| RAM | 4GB | 8GB or more |
| Disk Space | 500MB | 1GB |
| Node.js | 16.x | 18.x or later |
| Browser | Safari 14+ | Latest Chrome/Safari |
| Internet | 1 Mbps | 5 Mbps or faster |

## Next Steps

After successful installation:

1. ✅ Configure API keys in Settings
2. ✅ Add your brokerage accounts
3. ✅ Add stocks to your portfolio
4. ✅ Set up custom price alerts
5. ✅ Configure alert delivery channels
6. ✅ Bookmark the application URL
7. ✅ Review documentation for advanced features

## Conclusion

You're now ready to use FIRE Sentinel to monitor your investment portfolio! The application will help you track stock prices, analyze news sentiment, and receive alerts when important thresholds are met.

For questions or issues, refer to the documentation files in the project directory or check the GitHub repository for updates.

Happy investing! 🚀📈
