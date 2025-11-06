/**
 * Cosmos DB Setup Script
 * 
 * Run this script to create the necessary database and containers for YourSocialLinks
 * 
 * Usage:
 *   npx ts-node scripts/setup-cosmos.ts
 * 
 * Prerequisites:
 *   - Set environment variables COSMOS_ENDPOINT and COSMOS_KEY
 *   - npm install @azure/cosmos
 */

import { CosmosClient } from '@azure/cosmos';

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DB || 'ysl';

if (!endpoint || !key) {
  console.error('Error: COSMOS_ENDPOINT and COSMOS_KEY environment variables are required');
  process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

async function setupCosmos() {
  console.log('🚀 Setting up Cosmos DB for YourSocialLinks...\n');

  try {
    // Create database
    console.log(`Creating database: ${databaseId}`);
    const { database } = await client.databases.createIfNotExists({
      id: databaseId,
      throughput: 400, // Serverless mode - can be removed if using serverless
    });
    console.log('✅ Database created/verified\n');

    // Create profiles container
    console.log('Creating profiles container...');
    await database.containers.createIfNotExists({
      id: 'profiles',
      partitionKey: { paths: ['/handle'] },
      indexingPolicy: {
        automatic: true,
        indexingMode: 'consistent',
        includedPaths: [{ path: '/*' }],
        excludedPaths: [{ path: '/"_etag"/?' }],
      },
    });
    console.log('✅ Profiles container created/verified\n');

    // Create events container
    console.log('Creating events container...');
    await database.containers.createIfNotExists({
      id: 'events',
      partitionKey: { paths: ['/handle'] },
      indexingPolicy: {
        automatic: true,
        indexingMode: 'consistent',
        includedPaths: [{ path: '/*' }],
        excludedPaths: [{ path: '/"_etag"/?' }],
      },
      defaultTtl: 2592000, // 30 days - events auto-delete after 30 days
    });
    console.log('✅ Events container created/verified\n');

    console.log('🎉 Cosmos DB setup complete!');
    console.log('\nNext steps:');
    console.log('1. Update your Azure App Settings or .env file with:');
    console.log(`   COSMOS_ENDPOINT=${endpoint}`);
    console.log(`   COSMOS_KEY=<your-key>`);
    console.log(`   COSMOS_DB=${databaseId}`);
    console.log(`   COSMOS_PROFILES_CONTAINER=profiles`);
    console.log(`   COSMOS_EVENTS_CONTAINER=events`);

  } catch (error) {
    console.error('❌ Error setting up Cosmos DB:', error);
    process.exit(1);
  }
}

setupCosmos();


