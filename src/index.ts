import { writeFileSync } from "fs";

async function main(): Promise<void> {
  const response = await fetch("https://api.voyalcine.net/films/5875/tree/3250");
  const data: unknown = await response.json();

  writeFileSync("response.json", JSON.stringify(data, null, 2));
}

void main();
