import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { getLocalDb } from '../db';
import { testItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'node:crypto';

describe('Database Schema Expansion Verification (UTS)', () => {
  let db: any;

  beforeAll(async () => {
    // ローカル開発用DB接続の初期化
    db = await getLocalDb();
  });

  beforeEach(async () => {
    // 既存データの全削除（テストの無菌性を確保）
    await db.delete(testItems);
  });

  // TC-DB-01: WBS自己参照（親子構造）の論理整合性
  it('TC-DB-01: should correctly maintain parent-child relationships', async () => {
    const parentId = crypto.randomUUID();
    const childId = crypto.randomUUID();

    // 1. 親レコード(A)をインサート
    await db.insert(testItems).values({
      id: parentId,
      title: 'Parent Task A',
      expectedResult: 'Parent Result',
      updatedAt: new Date(),
    });

    // 2. 子レコード(B)の parentId に (A)のUUIDを指定してインサート
    await db.insert(testItems).values({
      id: childId,
      parentId: parentId,
      title: 'Child Task B',
      expectedResult: 'Child Result',
      updatedAt: new Date(),
    });

    // 3. データの取得と検証
    const results = await db.select().from(testItems).where(eq(testItems.id, childId));
    
    expect(results).toHaveLength(1);
    expect(results[0].parentId).toBe(parentId);
    console.log(`[PASS] TC-DB-01: Child Task B (id:${childId}) correctly refers to Parent Task A (id:${parentId})`);
  });

  // TC-DB-02: 基本的なバリデーション確認（データ型）
  it('TC-DB-02: estimated_hours should be stored as a number', async () => {
    const taskId = crypto.randomUUID();
    const estimatedHours = 8.5;

    await db.insert(testItems).values({
      id: taskId,
      title: 'Validation Task',
      expectedResult: 'Value Check',
      estimatedHours: estimatedHours,
      updatedAt: new Date(),
    });

    const results = await db.select().from(testItems).where(eq(testItems.id, taskId));
    
    expect(results[0].estimatedHours).toBe(estimatedHours);
    expect(typeof results[0].estimatedHours).toBe('number');
    console.log(`[PASS] TC-DB-02: estimated_hours (${estimatedHours}) correctly stored as type: ${typeof results[0].estimatedHours}`);
  });
});
