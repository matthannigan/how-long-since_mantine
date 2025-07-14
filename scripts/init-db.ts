// Database initialization script for development
import { testDatabaseSetup } from '@/lib/db/test-setup';

async function main() {
  console.log('🚀 Initializing How Long Since database...\n');

  const success = await testDatabaseSetup();

  if (success) {
    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Database initialization failed!');
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}
