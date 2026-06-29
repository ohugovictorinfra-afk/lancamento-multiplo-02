import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const API_KEY = "4b661027b5964ede9dd1b67b0ddc95a9";
const BASE    = "https://api.assemblyai.com/v2";
const ASSETS  = join(dirname(fileURLToPath(import.meta.url)), "client/public/assets");

async function upload(filePath) {
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { authorization: API_KEY, "content-type": "application/octet-stream" },
    body: readFileSync(filePath),
  });
  const { upload_url } = await res.json();
  return upload_url;
}

async function transcribe(audioUrl) {
  const res = await fetch(`${BASE}/transcript`, {
    method: "POST",
    headers: { authorization: API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ audio_url: audioUrl, language_code: "pt" }),
  });
  const { id } = await res.json();

  process.stdout.write("  aguardando");
  while (true) {
    await new Promise(r => setTimeout(r, 3000));
    const poll  = await fetch(`${BASE}/transcript/${id}`, { headers: { authorization: API_KEY } });
    const data  = await poll.json();
    if (data.status === "completed") { process.stdout.write("\n"); return data.text; }
    if (data.status === "error")     throw new Error(data.error);
    process.stdout.write(".");
  }
}

for (let i = 1; i <= 4; i++) {
  console.log(`\n[${i}/4] Upload depoimento-${i}.mp4...`);
  const url  = await upload(join(ASSETS, `depoimento-${i}.mp4`));
  const text = await transcribe(url);
  console.log(`\n=== DEPOIMENTO ${i} ===\n${text}\n${"─".repeat(60)}`);
}
