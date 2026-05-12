import dotenv from 'dotenv';
import { connectToDatabase } from '../src/lib/mongoose';
import Admin from '../src/models/Admin';

dotenv.config({ path: '.env.local' });

async function seedAdmin() {
  try {
    await connectToDatabase();

    // Clear existing admins (optional)
    await Admin.deleteMany({});

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'awadaya18@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '1234554321';

    const admin = await Admin.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      fullName: 'Admin User',
      isActive: true,
    });

    console.log('✅ Admin user seeded successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
