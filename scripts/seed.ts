import dotenv from "dotenv";
import { seedProducts } from "../src/data/products";

dotenv.config({ path: ".env.local" });

async function seed() {
  const { connectToDatabase } = await import("../src/lib/mongoose");
  const { default: Product } = await import("../src/models/Product");

  await connectToDatabase();

  await Product.deleteMany({});
  // Seed products without images - admins will manually add image URLs from Google
  const productsWithoutImages = seedProducts.map(product => ({
    ...product,
    images: [],
    image: '',
  }));
  await Product.insertMany(productsWithoutImages);

  console.log(`Seeded ${productsWithImages.length} products.`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});