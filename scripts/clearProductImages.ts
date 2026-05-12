import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function clearImages() {
  const { connectToDatabase } = await import("../src/lib/mongoose");
  const { default: Product } = await import("../src/models/Product");

  await connectToDatabase();

  // Clear all product images
  const result = await Product.updateMany(
    {},
    {
      $set: {
        image: "",
        images: [],
      },
    }
  );

  console.log(`✅ Cleared images from ${result.modifiedCount} products.`);
  console.log("All products now have empty image fields.");
  console.log("You can now manually add image URLs through the Admin Dashboard.");

  process.exit(0);
}

clearImages().catch((error) => {
  console.error("❌ Error clearing images:", error);
  process.exit(1);
});
