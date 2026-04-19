import { test, expect } from '@playwright/test';

test.describe('Database Schema Vertical Integration (TC-DB-04)', () => {
  test('should successfully write and read newly added fields via API', async ({ page }) => {
    const baseUrl = 'http://localhost:5173';
    await page.goto(baseUrl);

    const result = await page.evaluate(async () => {
      try {
        const newItem = {
          title: 'E2E Verification Task ' + Date.now(),
          expectedResult: 'Passed vertical integration',
          estimatedHours: 42,
          updatedAt: new Date().toISOString()
        };

        const postResp = await fetch('/api/test-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
        
        if (!postResp.ok) {
          return { error: 'POST failed', status: postResp.status, text: await postResp.text() };
        }

        const getResp = await fetch('/api/test-items');
        if (!getResp.ok) {
          return { error: 'GET failed', status: getResp.status, text: await getResp.text() };
        }
        
        const data = await getResp.json();
        const items = data.items || [];
        const verifiedItem = items.find((i: any) => i.title.startsWith('E2E Verification Task'));
        
        return {
          success: !!verifiedItem,
          estimatedHours: verifiedItem?.estimatedHours,
          allFieldsCleared: verifiedItem ? ('estimatedHours' in verifiedItem) : false,
          item: verifiedItem
        };
      } catch (e: any) {
        return { error: 'Browser Exception', message: e.message, stack: e.stack };
      }
    });

    console.log('[DEBUG E2E Result]', JSON.stringify(result, null, 2));
    
    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.estimatedHours).toBe(42);
  });
});
