import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { connectToDatabase } from '../src/lib/mongoose';
import Product from '../src/models/Product';

interface ImageUrlsMapping {
  [laptopName: string]: {
    front?: string;
    side?: string;
    back?: string;
    top?: string;
  };
}

interface ImageDownloadResult {
  laptop: string;
  angle: string;
  success: boolean;
  path?: string;
  error?: string;
}

// Create slug from strings
function createSlug(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Download image from URL with validation
async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      resolve(false);
      return;
    }

    const makeRequest = (urlStr: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        resolve(false);
        return;
      }

      const protocol = urlStr.startsWith('https') ? https : http;

      protocol
        .get(
          urlStr,
          {
            timeout: 15000,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          },
          (response) => {
            // Handle redirects
            if (
              response.statusCode &&
              response.statusCode >= 300 &&
              response.statusCode < 400 &&
              response.headers.location
            ) {
              makeRequest(response.headers.location, redirectCount + 1);
              return;
            }

            if (response.statusCode !== 200) {
              resolve(false);
              return;
            }

            const contentType = response.headers['content-type'];
            if (
              !contentType ||
              (!contentType.includes('image/jpeg') &&
                !contentType.includes('image/png') &&
                !contentType.includes('image/webp'))
            ) {
              resolve(false);
              return;
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
              try {
                const buffer = Buffer.concat(chunks);

                // Check file size (must be at least 50KB, likely not a thumbnail)
                if (buffer.length < 50000) {
                  resolve(false);
                  return;
                }

                // Ensure directory exists
                const dir = path.dirname(outputPath);
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }

                fs.writeFileSync(outputPath, buffer);
                resolve(true);
              } catch (error) {
                resolve(false);
              }
            });
          }
        )
        .on('error', () => resolve(false))
        .on('timeout', () => resolve(false));
    };

    makeRequest(url);
  });
}

// Main download function - uses pre-extracted image URLs
async function downloadAllLaptopImages() {
  try {
    // Check if image URLs mapping file exists
    const mappingPath = path.join(process.cwd(), 'laptop-direct-image-urls.json');
    if (!fs.existsSync(mappingPath)) {
      console.error(
        `❌ Image URLs file not found: ${mappingPath}\n` +
        `Please create a file with image URLs first using the included HTML tool.`
      );
      process.exit(1);
    }

    await connectToDatabase();

    const imageUrlsMapping: ImageUrlsMapping = JSON.parse(
      fs.readFileSync(mappingPath, 'utf-8')
    );

    const results: ImageDownloadResult[] = [];
    const downloadedMapping: ImageUrlsMapping = {};

    console.log('🚀 Starting image download process...\n');

    for (const [laptopName, angles] of Object.entries(imageUrlsMapping)) {
      const brandSlug = createSlug(laptopName.split(' ')[0]);
      const modelSlug = createSlug(
        laptopName.substring(laptopName.indexOf(' ') + 1)
      );
      const laptopSlug = `${brandSlug}-${modelSlug}`;
      const imageDir = path.join(process.cwd(), 'public', 'images', 'laptops', laptopSlug);

      downloadedMapping[laptopName] = {};

      console.log(`📱 ${laptopName}`);

      for (const [angleName, imageUrl] of Object.entries(angles)) {
        if (!imageUrl) continue;

        const fileName = `${angleName}.jpg`;
        const filePath = path.join(imageDir, fileName);
        const publicPath = `/images/laptops/${laptopSlug}/${fileName}`;

        try {
          process.stdout.write(`  ⏳ ${angleName}...`);

          if (await downloadImage(imageUrl, filePath)) {
            console.log(' ✅');
            downloadedMapping[laptopName][angleName] = publicPath;
            results.push({
              laptop: laptopName,
              angle: angleName,
              success: true,
              path: publicPath
            });
          } else {
            throw new Error('Failed to download or validate image');
          }
        } catch (error) {
          console.log(` ❌ (${error})`);
          results.push({
            laptop: laptopName,
            angle: angleName,
            success: false,
            error: String(error)
          });
        }

        // Rate limiting - wait between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log();
    }

    // Save downloaded mapping to file
    const downloadedPath = path.join(
      process.cwd(),
      'laptop-images-downloaded.json'
    );
    fs.writeFileSync(downloadedPath, JSON.stringify(downloadedMapping, null, 2));
    console.log(`\n✅ Downloaded images mapping saved to: ${downloadedPath}`);

    // Save results/failures log
    const failures = results.filter((r) => !r.success);
    if (failures.length > 0) {
      const failuresPath = path.join(
        process.cwd(),
        'image-download-failures.json'
      );
      fs.writeFileSync(failuresPath, JSON.stringify(failures, null, 2));
      console.log(`\n⚠️  Failed downloads logged to: ${failuresPath}`);
      console.log(
        `\n📋 Summary: ${results.length - failures.length}/${results.length} images downloaded successfully`
      );
    } else {
      console.log(`\n✅ All ${results.length} images downloaded successfully!`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

downloadAllLaptopImages();
