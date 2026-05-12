import dotenv from "dotenv";
import { seedProducts } from "../src/data/products";

dotenv.config({ path: ".env.local" });

const buildUnsplashSourceSet = (brand: string, modelName: string) => {
  const queryBase = encodeURIComponent(`${brand},${modelName},tech,laptop`);
  const queryKeyboard = encodeURIComponent(`${brand},${modelName},keyboard,laptop`);
  const querySide = encodeURIComponent(`${brand},${modelName},side,laptop`);
  const queryOffice = encodeURIComponent(`${brand},${modelName},office,laptop`);

  return [
    `https://source.unsplash.com/featured/800x601?${queryBase}&auto=format`,
    `https://source.unsplash.com/featured/800x602?${queryKeyboard}&auto=format`,
    `https://source.unsplash.com/featured/800x603?${querySide}&auto=format`,
    `https://source.unsplash.com/featured/800x604?${queryOffice}&auto=format`,
  ];
};

const applyImagesToProduct = (product: (typeof seedProducts)[number]) => {
  const images = buildUnsplashSourceSet(product.brand, product.modelName);

  return {
    ...product,
    images,
    image: images[0],
  };
};

async function seed() {
  const { connectToDatabase } = await import("../src/lib/mongoose");
  const { default: Product } = await import("../src/models/Product");

  await connectToDatabase();

  await Product.deleteMany({});
  const productsWithImages = seedProducts.map(applyImagesToProduct);
  await Product.insertMany(productsWithImages);

  console.log(`Seeded ${productsWithImages.length} products.`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});