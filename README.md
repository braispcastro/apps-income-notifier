# 📱 AdMob Income Notifier

**AdMob Income Notifier** is a lightweight tool designed to run on a Raspberry Pi (using Docker and Bun) that informs you daily of your total accumulated earnings from **Google AdMob**.

![AdMob Notifier](https://img.shields.io/badge/Runtime-Bun-black?style=for-the-badge&logo=bun)
![Docker](https://img.shields.io/badge/Deployment-Docker-blue?style=for-the-badge&logo=docker)
![Telegram](https://img.shields.io/badge/Notifications-Telegram-blue?style=for-the-badge&logo=telegram)

## 🚀 Features

- **Daily Reporting**: Get your AdMob earnings directly on Telegram.
- **Data Freshness**: Reports AdMob data from yesterday.
- **Telegram Notifications**: Receive a formatted message every morning.
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
git clone https://github.com/braispcastro/apps-income-notifier.git
cd apps-income-notifier
bun install
```

### 2. Environment Variables
Create a `.env` file in the project root (use `.env.example` as a template):

#### Google AdMob
- `AD_MOB_CLIENT_ID`: Your Google Cloud Client ID.
- `AD_MOB_CLIENT_SECRET`: Your Google Cloud Client Secret.
- `AD_MOB_REFRESH_TOKEN`: Generated via the authentication script (see below).
- `AD_MOB_ACCOUNT_ID`: Your publisher ID (e.g., `pub-1234567890123456`).

#### Notifications and App
- `TELEGRAM_BOT_TOKEN`: Token from @BotFather.
- `TELEGRAM_CHAT_ID`: Your Telegram Chat ID.
- `CRON_SCHEDULE`: Cron expression (default: `0 8 * * *` - 8:00 AM).
- `DRY_RUN`: Set to `true` to test the delivery immediately.
- `TZ`: Timezone for the notification schedule (default: `Europe/Madrid`).

### 3. Generate AdMob Refresh Token
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
