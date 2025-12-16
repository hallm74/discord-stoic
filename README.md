# Discord Stoic Bot

A minimal Node.js project that fetches daily Stoic quotes, generates modern reflections using OpenAI, and posts them to Discord via webhooks.

## Features

- 🕐 Runs automatically once per day via GitHub Actions
- 📜 Fetches authentic Stoic quotes from [stoic.tekloon.net](https://stoic.tekloon.net/stoic-quote)
- 🤖 Uses GitHub Models API (gpt-4o-mini) to generate contemporary reflections
- 💬 Posts to multiple Discord channels via webhooks
- 💰 **100% FREE** - GitHub Models API is free with rate limits
- 🚫 No database, no bot accounts, no complexity

## Setup

### 1. GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- **GITHUB_TOKEN**: Automatically available in GitHub Actions (no setup needed!)
- **DISCORD_WEBHOOKS**: Your Discord webhook URL(s)

> **Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions with access to GitHub Models API - you don't need to create or configure it!

#### Getting Discord Webhooks

For each Discord channel you want to post to:
1. Go to Channel Settings → Integrations → Webhooks
2. Click "New Webhook"
3. Customize name/avatar (optional)
4. Copy the Webhook URL

If you have multiple channels, separate URLs with commas:
```
https://discord.com/api/webhooks/123.../abc,https://discord.com/api/webhooks/456.../def
```

### 2. Enable GitHub Actions

Ensure GitHub Actions is enabled for your repository (Settings → Actions → General → Allow all actions).

### 3. Schedule

The workflow runs daily at 8:00 AM UTC by default. To change this, edit the cron schedule in [.github/workflows/daily-stoic.yml](.github/workflows/daily-stoic.yml):

```yaml
schedule:
  - cron: '0 8 * * *'  # Change time here
```

## Manual Testing

### Local Testing

1. **Get a GitHub Personal Access Token (Classic)**:
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens)
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name (e.g., "Discord Stoic Bot")
   - **No scopes required** - leave all checkboxes unchecked
   - Click "Generate token"
   - Copy the token (starts with `ghp_`)

2. **Create a `.env` file** from the example:
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** with your actual credentials:
   ```bash
   GITHUB_TOKEN=github_pat_your-actual-token-here
   DISCORD_WEBHOOKS=https://discord.com/api/webhooks/your-webhook-url
   ```

4. **Install dependencies and run**:
   ```bash
   npm install
   npm start
   ```

The script will automatically load your `.env` file when running locally.

**Alternative (without .env file):**
```bash
export GITHUB_TOKEN="github_pat_your-token-here"
export DISCORD_WEBHOOKS="https://discord.com/api/webhooks/..."
npm start
```

### GitHub Actions Testing

Go to Actions → Daily Stoic → Run workflow to trigger manually.

## Cost Estimate

- **GitHub Models API**: Free (with rate limits)
- **GitHub Actions**: Free (under 2,000 minutes/month)
- **Total**: $0.00 (completely free!)

## Message Format

```
**Daily Stoic**
"<quote>" — <author>

<modern reflection>
```

Example:
```
**Daily Stoic**
"The best revenge is to be unlike him who performed the injury." — Marcus Aurelius

When someone wrongs us, our first instinct is often to strike back or stew in resentment. But Marcus reminds us that the real power move is growth. By refusing to mirror toxic behavior, we break the cycle. We don't waste energy on payback—we invest it in becoming better. That's the revenge that actually matters: proving that their actions didn't diminish you, they refined you.
```

## Project Structure

```
discord-stoic/
├── .github/
│   └── workflows/
│       └── daily-stoic.yml    # GitHub Actions workflow
├── scripts/
│   └── daily-stoic.js         # Main bot script
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

## Customization

### Change AI Model

Edit `MODEL_NAME` in [scripts/daily-stoic.js](scripts/daily-stoic.js):

```javascript
const MODEL_NAME = 'gpt-4o-mini'; // Available models: gpt-4o-mini, gpt-4o, etc.
```

See available models at [github.com/marketplace/models](https://github.com/marketplace/models)

### Adjust Reflection Length

Edit `MAX_REFLECTION_WORDS` in [scripts/daily-stoic.js](scripts/daily-stoic.js):

```javascript
const MAX_REFLECTION_WORDS = 120; // Increase or decrease
```

### Change Reflection Style

Edit the prompt in the `generateReflection()` function to adjust tone, style, or approach.

## Troubleshooting

### Workflow Not Running

- Check that GitHub Actions is enabled
- Verify the cron schedule syntax
- Check the Actions tab for any errors

### GitHub Models API Errors

- GITHUB_TOKEN is automatically available in Actions (no setup needed)
- For local testing, verify your personal access token is valid
- Check rate limits at [github.com/marketplace/models](https://github.com/marketplace/models)
- Ensure the model name is valid

### Discord Webhook Errors

- Verify webhook URLs are correct and active
- Test webhooks manually using curl:
  ```bash
  curl -X POST "YOUR_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"content": "Test message"}'
  ```

### No Output in Actions

Check the Actions tab for detailed logs of each run.

## License

MIT
