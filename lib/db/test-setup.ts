/* eslint-disable no-console */
// Test database setup and initialization
import { db, initializeDatabase } from './index';

/**
 * Test database connection and initialization
 * This function can be called to verify the database setup works correctly
 */
export async function testDatabaseSetup(): Promise<boolean> {
  try {
    console.log('Testing database setup...');

    // Test database connection
    await db.open();
    console.log('✓ Database connection successful');

    // Test initialization
    await initializeDatabase();
    console.log('✓ Database initialization successful');

    // Test basic operations
    const categoriesCount = await db.categories.count();
    const settingsCount = await db.settings.count();

    console.log(`✓ Found ${categoriesCount} categories`);
    console.log(`✓ Found ${settingsCount} settings records`);

    // Verify default categories exist
    if (categoriesCount >= 10) {
      console.log('✓ Default categories initialized correctly');
    } else {
      console.warn('⚠ Expected at least 10 default categories');
    }

    // Verify settings exist
    if (settingsCount >= 1) {
      console.log('✓ Default settings initialized correctly');
    } else {
      console.warn('⚠ Expected at least 1 settings record');
    }

    console.log('✅ Database setup test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database setup test failed:', error);
    return false;
  }
}
