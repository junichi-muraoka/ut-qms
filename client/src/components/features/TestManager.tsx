import React from 'react';
import type { TestItem } from '../../types';

interface TestManagerProps {
  testItems: TestItem[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
}

const TestManager: React.FC<TestManagerProps> = ({ testItems, loading, onStatusChange }) => {
  return (
    <section className="card">
      {loading ? (
        <p>読み込み中...</p>
      ) : testItems.length === 0 ? (
        <p>データがありません。「新規作成」から追加してください。</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>項目名</th>
              <th>前提条件</th>
              <th>期待される結果</th>
              <th>ステータス</th>
              <th>最終更新</th>
            </tr>
          </thead>
          <tbody>
            {testItems.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.precondition}</td>
                <td>{item.expectedResult}</td>
                <td>
                  <select 
                    className={`badge badge-${item.status.toLowerCase()}`}
                    style={{ border: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}
                    value={item.status}
                    onChange={(e) => onStatusChange(item.id, e.target.value)}
                  >
                    <option value="NoRun">未実施</option>
                    <option value="Pass">合格</option>
                    <option value="Fail">不合格</option>
                    <option value="Blocked">保留</option>
                  </select>
                </td>
                <td>{new Date(item.updatedAt).toLocaleString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default TestManager;
