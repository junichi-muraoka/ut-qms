import React from 'react';
import type { Defect } from '../../types';

interface DefectManagerProps {
  defects: Defect[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
}

const DefectManager: React.FC<DefectManagerProps> = ({ defects, loading, onStatusChange }) => {
  return (
    <section className="card">
      {loading ? (
        <p>読み込み中...</p>
      ) : defects.length === 0 ? (
        <p>不具合データがありません。「新規作成」から登録してください。</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>概要</th>
              <th>優先度</th>
              <th>ステータス</th>
              <th>最終更新</th>
            </tr>
          </thead>
          <tbody>
            {defects.map((defect) => (
              <tr key={defect.id}>
                <td>{defect.title}</td>
                <td>
                  <span className={`priority priority-${defect.priority.toLowerCase()}`}>
                    {defect.priority === 'Critical' ? '最優先' : 
                     defect.priority === 'High' ? '高' : 
                     defect.priority === 'Medium' ? '中' : '低'}
                  </span>
                </td>
                <td>
                  <select 
                    className={`badge badge-${defect.status.toLowerCase()}`}
                    style={{ border: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}
                    value={defect.status}
                    onChange={(e) => onStatusChange(defect.id, e.target.value)}
                  >
                    <option value="Open">オープン</option>
                    <option value="Investigating">調査中</option>
                    <option value="Fixed">修正済</option>
                    <option value="Verified">確認済</option>
                    <option value="Closed">クローズ済</option>
                  </select>
                </td>
                <td>{new Date(defect.updatedAt).toLocaleString('ja-JP')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default DefectManager;
