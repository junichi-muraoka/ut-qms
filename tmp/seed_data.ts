import { getLocalDb } from '../server/db/index';
import * as schema from '../server/db/schema';

async function seed() {
  const db = await getLocalDb();

  console.log('Seeding mock data...');

  // 1. Issues
  await db.insert(schema.issues).values([
    {
      id: crypto.randomUUID(),
      title: 'ダッシュボードのUI改善',
      status: 'InProgress',
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      title: 'D1データベースの移行検証',
      status: 'Done',
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      title: 'モバイルレスポンシブ対応',
      status: 'Todo',
      updatedAt: new Date(),
    }
  ]);

  // 2. Test Items
  const testId1 = crypto.randomUUID();
  await db.insert(schema.testItems).values([
    {
      id: testId1,
      title: 'ログイン機能の正常系テスト',
      status: 'Pass',
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      title: 'APIエンドポイントのバリデーションテスト',
      status: 'Fail',
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      title: 'ダークモードの切り替えテスト',
      status: 'NoRun',
      updatedAt: new Date(),
    }
  ]);

  // 3. Defects
  await db.insert(schema.defects).values([
    {
      id: crypto.randomUUID(),
      title: 'Safariで色味が正しく表示されない',
      status: 'Open',
      testItemId: testId1,
      updatedAt: new Date(),
    }
  ]);

  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
