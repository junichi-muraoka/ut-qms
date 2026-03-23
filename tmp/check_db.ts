import { getLocalDb } from '../server/db/index';
import * as schema from '../server/db/schema';

async function check() {
  const db = await getLocalDb();
  
  const issues = await db.select().from(schema.issues);
  const testItems = await db.select().from(schema.testItems);
  const defects = await db.select().from(schema.defects);

  console.log('--- Database Check ---');
  console.log('Issues:', issues.length);
  console.log('Test Items:', testItems.length);
  console.log('Defects:', defects.length);
  
  if (issues.length > 0) {
    console.log('Sample Issue:', issues[0].title);
  }
}

check().catch(console.error);
