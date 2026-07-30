# Odyssey in Imax Signaler

> **Deprecated.** This project is no longer maintained. The hourly GitHub Actions schedule is disabled, so no notifications are sent automatically. The code is kept for reference and can still be run manually.

Monitors IMAX showtimes at Norcenter and sends a Telegram notification when new screenings become available.

## Setup

1. Copy the example environment file:

   ```sh
   cp .env.example .env
   ```

2. Add your Telegram credentials to `.env`:

   ```env
   TG_BOT_KEY=
   TG_CHAT_ID=
   ```

3. Install the dependencies and start the monitor:

   ```sh
   npm install
   npm start
   ```

On the first run, the project saves the current showtimes to `data.json`. Future runs compare the latest showtimes with that file and notify you when new screenings are found.

The GitHub Actions workflow no longer runs on a schedule. It can still be triggered manually from the Actions tab, which updates `data.json` when the showtimes change.
