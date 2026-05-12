require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function clearImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection('products');
    
    const result = await collection.updateMany(
      {},
      {
        $set: {
          image: '',
          images: []
        }
      }
    );

    console.log('✅ Successfully cleared images from ' + result.modifiedCount + ' products');
    console.log('📝 All product image fields are now empty.');
    console.log('You can now manually add image URLs through the Admin Dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearImages();
