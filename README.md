# AdMob Daily Income Notifier (Bun + Docker)

A lightweight, automated notifier that fetches your daily Google AdMob earnings and sends a formatted report to your Telegram account. Designed to run efficiently on a Raspberry Pi using Bun and Docker.

![AdMob Notifier](https://img.shields.io/badge/Runtime-Bun-black?style=for-the-badge&logo=bun)
![Docker](https://img.shields.io/badge/Deployment-Docker-blue?style=for-the-badge&logo=docker)
![Telegram](https://img.shields.io/badge/Notifications-Telegram-blue?style=for-the-badge&logo=telegram)

## 🚀 Features

- **Daily Reports**: Automatically fetches yesterday's earnings every day at a scheduled time.
- **Telegram Notifications**: Beautifully formatted HTML messages.
- **Auto-Currency Detection**: Automatically detects your account's currency (EUR, USD, etc.).
- **Lightweight**: Built with Bun for minimal memory footprint (ideal for Raspberry Pi).
- **Docker Ready**: Easy deployment with `docker-compose`.
- **Git Secure**: Pre-configured `.gitignore` to prevent sensitive credential leaks.

## 🛠️ Prerequisites

- [Bun](https://bun.sh/) (for local development)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (for deployment)
- A Google Cloud Project with **AdMob API** enabled.
- A **Telegram Bot** (via [@BotFather](https://t.me/botfather)).

## 📦 Setup

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd apps-income-notifier
bun install
```

### 2. Environment Configuration
Copy the template and fill in your credentials:
```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `AD_MOB_CLIENT_ID` | From Google Cloud Console |
| `AD_MOB_CLIENT_SECRET` | From Google Cloud Console |
| `AD_MOB_ACCOUNT_ID` | Your AdMob Publisher ID (`pub-XXX`) |
| `AD_MOB_REFRESH_TOKEN` | Generated via Auth Helper |
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `TELEGRAM_CHAT_ID` | Your Telegram User ID |
| `CRON_SCHEDULE` | Cron expression (default: `0 8 * * *`) |

### 3. Generate Refresh Token
Run the built-in helper to authorize your app and get the `REFRESH_TOKEN`:
```bash
bun run auth
```
Follow the instructions in the terminal to authorize via your browser.

## 🏃 Usage

### Local Test (Dry Run)
Verify everything is working correctly without waiting for the cron schedule:
```bash
bun run dry-run
```

### Deployment (Raspberry Pi / Server)
Run the notifier in the background using Docker:
```bash
docker compose up -d
```

## 📂 Project Structure

- `src/index.ts`: Main entry point & scheduler.
- `src/admob.ts`: AdMob API reporting logic.
- `src/notifier.ts`: Telegram notification service.
- `src/auth-helper.ts`: OAuth2 token generation utility.
- `Dockerfile`: Multi-stage build for Bun.

## 🤝 Contributing
Feel free to open issues or pull requests. Future plans include adding **App Store Connect** integration.

## 📜 License
MIT
