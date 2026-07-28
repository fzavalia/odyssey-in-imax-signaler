import { config } from "dotenv";

config();

import { readFile, writeFile } from "node:fs/promises";
import { env } from "node:process";

type MovieData = {
  id: number;
  name: string;
  days: Record<
    string,
    {
      id: number;
      name: string;
      ewaveId: number;
      formats: {
        formatDescription: string;
        showId: string;
        performances: {
          performanceId: number;
          showTime: string;
        }[];
      }[];
    }[]
  >;
};

const DATA_FILE = new URL("../data.json", import.meta.url);
const TG_BOT_KEY = env.TG_BOT_KEY;
const TG_CHAT_ID = env.TG_CHAT_ID;

async function process(): Promise<void> {
  console.info("checking for new showtimes");

  const rMovieData = await fetchMovieData();
  const lMovieData = await getLocalMovieData();

  if (!lMovieData) {
    await writeFile(DATA_FILE, JSON.stringify(rMovieData, null, 2), "utf-8");
    console.info("saved initial movie data");

    return;
  }

  const rLatestFunction = getLatestFunction(rMovieData);
  const lLatestFunction = getLatestFunction(lMovieData);

  console.info("compared latest showtimes", {
    remote: rLatestFunction,
    local: lLatestFunction,
  });

  if (rLatestFunction <= lLatestFunction) {
    console.info("no new showtimes found");

    return;
  }

  console.info("new showtimes found");

  await sendTelegramNotification();
}

async function fetchMovieData(): Promise<MovieData> {
  console.info("fetching movie data");

  const response = await fetch("https://api.voyalcine.net/films/5875/tree/3250");

  if (!response.ok) {
    throw new Error(`unable to fetch movie data: ${response.status}`);
  }

  console.info("fetched movie data");

  return await response.json();
}

async function getLocalMovieData(): Promise<MovieData | null> {
  try {
    const movieData = JSON.parse(await readFile(DATA_FILE, "utf8")) as MovieData;

    console.info("loaded local movie data");

    return movieData;
  } catch (error) {
    console.warn("unable to load local movie data", error);

    return null;
  }
}

function getLatestFunction(data: MovieData) {
  const showTimes: string[] = [];

  for (const [date, theaters] of Object.entries(data.days)) {
    for (const theater of theaters) {
      for (const format of theater.formats) {
        for (const performance of format.performances) {
          showTimes.push(`${date}T${performance.showTime}`);
        }
      }
    }
  }

  if (!showTimes.length) {
    throw new Error("no showtimes");
  }

  return showTimes.reduce((acc, next) => (next > acc ? next : acc), showTimes[0]!);
}

async function sendTelegramNotification(): Promise<void> {
  if (!TG_BOT_KEY || !TG_CHAT_ID) {
    throw new Error("missing Telegram configuration");
  }

  console.info("sending Telegram notification");

  const response = await fetch(`https://api.telegram.org/bot${TG_BOT_KEY}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text: "Hay nuevas funciones para la Odisea! https://entradas.todoshowcase.com/showcase/pelicula?filmid=5875&house_id=3250",
    }),
  });

  if (!response.ok) {
    throw new Error(`unable to send Telegram notification: ${response.status}`);
  }

  console.info("sent Telegram notification");
}

async function run(): Promise<void> {
  try {
    await process();
  } catch (error) {
    console.error("unable to process", error);
  }
}

void run();

setInterval(
  () => {
    void run();
  },
  60 * 60 * 1000,
);
