import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function clearImages() {
  const { connectToDatabase } = await import("../src/lib/mongoose");
  const { default: Product } = await import("../src/models/Product");

  await connectToDatabase();

  const result = await Product.updateMany({}, { image: "", images: [] });

  console.log(`✅ Cleared images from ${result.modifiedCount} products`);

  process.exit(0);
}

clearImages().catch((error) => {
  console.error("❌ Error clearing images:", error);
  process.exit(1);
});
