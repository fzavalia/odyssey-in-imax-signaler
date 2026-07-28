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
  const rMovieData = await fetchMovieData();
  const lMovieData = await getLocalMovieData();

  if (!lMovieData) {
    await writeFile(DATA_FILE, JSON.stringify(rMovieData, null, 2), "utf-8");

    return;
  }

  const rLatestFunction = getLatestFunction(rMovieData);
  const lLatestFunction = getLatestFunction(lMovieData);

  if (rLatestFunction <= lLatestFunction) {
    return;
  }

  await sendTelegramNotification();
}

async function fetchMovieData(): Promise<MovieData> {
  const response = await fetch("https://api.voyalcine.net/films/5875/tree/3250");

  return await response.json();
}

async function getLocalMovieData(): Promise<MovieData | null> {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8")) as MovieData;
  } catch (error) {
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

  await fetch(`https://api.telegram.org/bot${TG_BOT_KEY}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: TG_CHAT_ID,
      text: "Hay nuevas funciones para la Odisea! https://entradas.todoshowcase.com/showcase/pelicula?filmid=5875&house_id=3250",
    }),
  });
}

void process();

setInterval(
  () => {
    try {
      void process();
    } catch (error) {
      console.error("unable to process");
      console.error(error);
    }
  },
  60 * 60 * 1000,
);
