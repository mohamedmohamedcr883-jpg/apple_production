const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Load env variables
dotenv.config({ path: path.join(__dirname, 'BE/.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!MONGODB_URI || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Missing required environment variables in BE/.env");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected!");

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');

  // Find all products with localhost image URLs
  const products = await productsCollection.find({
    image: { $regex: /localhost/ }
  }).toArray();

  console.log(`Found ${products.length} products with localhost image URLs to migrate.\n`);

  let successCount = 0;
  let errorCount = 0;
  const BATCH_SIZE = 5; // Upload 5 at a time for speed

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Extract the local file path from the URL
    // e.g. "http://localhost:3000/uploads/stickers/anime/naruto.png" → "uploads/stickers/anime/naruto.png"
    const urlPath = product.image.replace(/^https?:\/\/localhost:\d+\//, '');
    const localPath = path.join(__dirname, urlPath);

    const pct = ((i + 1) / products.length * 100).toFixed(1);
    process.stdout.write(`[${i + 1}/${products.length}] (${pct}%) "${product.name}" ... `);

    if (!fs.existsSync(localPath)) {
      console.log(`SKIP (file not found: ${urlPath})`);
      errorCount++;
      continue;
    }

    try {
      const folder = `apple-store/${product.category || 'misc'}/${product.type || 'misc'}`;
      const result = await cloudinary.uploader.upload(localPath, { folder });

      await productsCollection.updateOne(
        { _id: product._id },
        { $set: { image: result.secure_url } }
      );

      console.log("OK");
      successCount++;
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n--- Migration Complete ---`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors:  ${errorCount}`);
  console.log(`Total:   ${products.length}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
