import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../src/lib/mongoose';
import Product from '../src/models/Product';

interface ImageMapping {
  [laptopName: string]: {
    front?: string;
    side?: string;
    back?: string;
    top?: string;
  };
}

interface ImageUrls {
  front?: string;
  side?: string;
  back?: string;
  top?: string;
}

// Create slug for matching
function createSlug(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Match laptop name to product in database
async function matchLaptopToProduct(laptopName: string): Promise<any> {
  // Try exact match first
  let parts = laptopName.split(' ');
  let brand = parts[0];
  let model = parts.slice(1).join(' ');

  let product = await Product.findOne({
    brand: { $regex: brand, $options: 'i' },
    modelName: { $regex: model, $options: 'i' }
  });

  if (product) return product;

  // Try fuzzy match on brand
  product = await Product.findOne({
    brand: { $regex: brand, $options: 'i' }
  });

  if (product) return product;

  return null;
}

async function syncImagesToDatabase() {
  try {
    await connectToDatabase();

    const mappingPath = path.join(process.cwd(), 'laptop-images-downloaded.json');
    if (!fs.existsSync(mappingPath)) {
      console.error(
        `❌ Image mapping file not found: ${mappingPath}\n` +
        `Please run 'npm run download-images' first.`
      );
      process.exit(1);
    }

    const imageMapping: ImageMapping = JSON.parse(
      fs.readFileSync(mappingPath, 'utf-8')
    );

    console.log('🔄 Syncing downloaded images to database...\n');

    let updatedCount = 0;
    let failedCount = 0;

    for (const [laptopName, images] of Object.entries(imageMapping)) {
      try {
        // Find matching product
        const product = await matchLaptopToProduct(laptopName);

        if (!product) {
          console.log(`⚠️  Could not find product for: ${laptopName}`);
          failedCount++;
          continue;
        }

        // Build images array in order: front, side, back, top
        const imageUrls: string[] = [
          images.front || '',
          images.side || '',
          images.back || '',
          images.top || ''
        ];

        // Update product with images
        await Product.updateOne(
          { _id: product._id },
          {
            images: imageUrls,
            image: images.front || '' // Set main image to front view
          }
        );

        console.log(`✅ ${product.brand} ${product.modelName}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error processing ${laptopName}:`, error);
        failedCount++;
      }
    }

    console.log(
      `\n✅ Sync complete: ${updatedCount} products updated, ${failedCount} failed`
    );

    if (failedCount > 0) {
      console.log(`\n💡 Tip: Verify that product names in your database match the JSON keys`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncImagesToDatabase();
