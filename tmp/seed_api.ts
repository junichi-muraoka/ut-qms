async function seed() {
  const baseUrl = 'http://localhost:3001/api';

  console.log('Seeding mock data via API...');

  // 1. Issues
  const issues = [
    { title: 'ダッシュボードのUI改善', status: 'InProgress' },
    { title: 'D1データベースの移行検証', status: 'Done' },
    { title: 'モバイルレスポンシブ対応', status: 'Todo' }
  ];

  for (const issue of issues) {
    await fetch(`${baseUrl}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue)
    });
  }

  // 2. Test Items
  const testItems = [
    { title: 'ログイン機能の正常系テスト', status: 'Pass' },
    { title: 'APIエンドポイントのバリデーションテスト', status: 'Fail' },
    { title: 'ダークモードの切り替えテスト', status: 'NoRun' }
  ];

  for (const item of testItems) {
    await fetch(`${baseUrl}/test-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  }

  // 3. Defects
  const defects = [
    { title: 'Safariで色味が正しく表示されない', status: 'Open' }
  ];

  for (const defect of defects) {
    await fetch(`${baseUrl}/defects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defect)
    });
  }

  console.log('Seeding via API completed!');
}

seed().catch(console.error);
