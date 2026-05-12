import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });

const imageSources: Record<string, string> = {
  alienware: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1600&h=1000&fit=crop",
  asus: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1600&h=1000&fit=crop",
  msi: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=1000&fit=crop",
  lenovo: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1600&h=1000&fit=crop",
  hp: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=1000&fit=crop",
  dell: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&h=1000&fit=crop",
  hpSpectre: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1600&h=1000&fit=crop",
  thinkPad: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1600&h=1000&fit=crop",
  latitude: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1600&h=1000&fit=crop",
  apple: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=1000&fit=crop",
  acer: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1600&h=1000&fit=crop",
  ideapad: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=1000&fit=crop",
  genericA: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1600&h=1000&fit=crop",
  genericB: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1600&h=1000&fit=crop",
  razer: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=1000&fit=crop",
  predator: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1600&h=1000&fit=crop",
  yoga: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=1000&fit=crop",
  surface: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&h=1000&fit=crop",
  envy: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=1000&fit=crop",
  gSeries: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1600&h=1000&fit=crop",
  zenbook: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1600&h=1000&fit=crop",
  thinkbook: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=1600&h=1000&fit=crop",
};

const outputDir = path.join(process.cwd(), "public", "laptops");

const toFilename = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

async function downloadAndConvert(key: string, url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${key} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = `${toFilename(key)}.webp`;
  const outputPath = path.join(outputDir, filename);

  await sharp(buffer)
    .resize(1200, 800, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(outputPath);
}

async function fetchImages() {
  await fs.mkdir(outputDir, { recursive: true });

  const entries = Object.entries(imageSources);
  for (const [key, url] of entries) {
    try {
      await downloadAndConvert(key, url);
      console.log(`✅ ${key} -> ${path.join("/laptops", `${toFilename(key)}.webp`)}`);
    } catch (error) {
      console.error(`⚠️ Skipped ${key}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

fetchImages().catch((error) => {
  console.error("❌ Image fetch failed:", error);
  process.exit(1);
});
