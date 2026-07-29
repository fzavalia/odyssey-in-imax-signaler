# Imax Odyssey

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

The GitHub Actions workflow runs every hour and automatically updates `data.json` when the showtimes change.
