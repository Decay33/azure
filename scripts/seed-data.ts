/**
 * Seed Demo Data Script
 * 
 * Creates a demo profile for testing
 * 
 * Usage:
 *   npx ts-node scripts/seed-data.ts
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
const database = client.database(databaseId);
const container = database.container('profiles');

async function seedData() {
  console.log('🌱 Seeding demo data...\n');

  try {
    const demoProfile = {
      id: 'usr_demo_12345',
      userId: 'demo:user123',
      handle: 'demo',
      displayName: 'Demo User',
      bio: 'This is a demo profile for YourSocialLinks',
      avatarUrl: 'https://via.placeholder.com/150',
      theme: {
        style: 'gradient',
        accent: '#8b5cf6',
      },
      links: [
        {
          id: 'l1',
          label: 'My Website',
          url: 'https://example.com',
          icon: '🌐',
          order: 0,
        },
        {
          id: 'l2',
          label: 'TikTok Shop',
          url: 'https://tiktok.com/@demo',
          icon: '🛍️',
          order: 1,
        },
        {
          id: 'l3',
          label: 'YouTube Channel',
          url: 'https://youtube.com/@demo',
          icon: '▶️',
          order: 2,
        },
      ],
      videoLinks: [
        {
          id: 'v1',
          platform: 'tiktok',
          url: 'https://tiktok.com/@demo/video/123',
          thumb: 'https://via.placeholder.com/100',
          order: 0,
        },
        {
          id: 'v2',
          platform: 'youtube',
          url: 'https://youtube.com/watch?v=demo',
          thumb: 'https://via.placeholder.com/100',
          order: 1,
        },
      ],
      status: 'active',
      subscription: {
        tier: 'creator',
        status: 'active',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ttl: -1,
    };

    await container.items.upsert(demoProfile);
    console.log('✅ Demo profile created: https://yoursociallinks.com/demo\n');

    console.log('🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();


