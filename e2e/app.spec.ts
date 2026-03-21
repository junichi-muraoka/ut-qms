import { test, expect } from '@playwright/test';

test.describe('UT-QMS 基本画面遷移', () => {
  test('トップページが表示されること', async ({ page }) => {
    await page.goto('/');
    // サイドバーのロゴが表示される
    await expect(page.locator('.logo')).toHaveText('UT-QMS');
    // ナビゲーションが存在する
    await expect(page.locator('.nav-links')).toBeVisible();
  });

  test('テスト項目タブに遷移できること', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item', { hasText: 'テスト項目書' }).click();
    await expect(page.locator('.header h1')).toHaveText('テスト項目管理');
  });

  test('不具合管理タブに遷移できること', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item', { hasText: '不具合管理' }).click();
    await expect(page.locator('.header h1')).toHaveText('不具合一覧');
  });

  test('課題管理タブに遷移できること', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item', { hasText: '課題管理' }).click();
    await expect(page.locator('.header h1')).toHaveText('課題一覧');
  });

  test('ダッシュボードタブに遷移できること', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item', { hasText: 'ダッシュボード' }).click();
    await expect(page.locator('.header h1')).toHaveText('総合ダッシュボード');
  });
});

test.describe('UT-QMS テスト項目 CRUD', () => {
  test('テスト項目の新規作成フォームが開閉できること', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item', { hasText: 'テスト項目書' }).click();

    // 新規作成ボタンをクリック
    await page.locator('button', { hasText: '新規作成' }).click();
    // モーダルが表示される
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('h2', { hasText: 'テスト項目の新規作成' })).toBeVisible();

    // キャンセルで閉じる
    await page.locator('button', { hasText: 'キャンセル' }).click();
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
  });
});

test.describe('UT-QMS 課題管理カンバン', () => {
  test('カンバンボードの列（未着手・進行中・完了）が表示されること', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item', { hasText: '課題管理' }).click();

    // カンバンの3列が表示される
    await expect(page.locator('h3', { hasText: '未着手' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '進行中' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '完了' })).toBeVisible();
  });
});
