import React, { useState } from 'react';
import type { Defect } from '../../types/index';

interface DefectManagerProps {
  apiBaseUrl: string;
  defects: Defect[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
  onRefresh: () => void;
}

const DefectManager: React.FC<DefectManagerProps> = ({ apiBaseUrl, defects, loading, onStatusChange, onRefresh }) => {
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Defect>>({});

  const handleSelect = (defect: Defect) => {
    setSelectedDefect(defect);
    setEditData(defect);
    setIsEditing(false);
  };

  const handleSaveAnalysis = async () => {
    if (!selectedDefect) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/defects/${selectedDefect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedDefect(updated);
        setIsEditing(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to save defect analysis', err);
    }
  };

  return (
    <div className="defect-manager-layout" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Left side: List */}
      <section className="card" style={{ flex: selectedDefect ? '0 0 450px' : '1', overflowY: 'auto' }}>
        {loading ? (
          <p>読み込み中...</p>
        ) : defects.length === 0 ? (
          <p>不具合データがありません。「新規作成」から登録してください。</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>概要</th>
                {!selectedDefect && <th>優先度</th>}
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(defects) ? defects.map((defect) => (
                <tr 
                  key={defect.id} 
                  onClick={() => handleSelect(defect)}
                  style={{ cursor: 'pointer', backgroundColor: selectedDefect?.id === defect.id ? '#f0f7ff' : 'transparent' }}
                >
                  <td style={{ fontWeight: selectedDefect?.id === defect.id ? 'bold' : 'normal' }}>{defect.title}</td>
                  {!selectedDefect && (
                    <td>
                      <span className={`priority priority-${defect.priority.toLowerCase()}`}>
                        {defect.priority === 'Critical' ? '最優先' : 
                         defect.priority === 'High' ? '高' : 
                         defect.priority === 'Medium' ? '中' : '低'}
                      </span>
                    </td>
                  )}
                  <td>
                    <select 
                      className={`badge badge-${defect.status.toLowerCase()}`}
                      style={{ border: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}
                      value={defect.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(defect.id, e.target.value);
                      }}
                    >
                      <option value="Open">オープン</option>
                      <option value="Investigating">調査中</option>
                      <option value="Fixed">修正済</option>
                      <option value="Verified">確認済</option>
                      <option value="Closed">クローズ済</option>
                    </select>
                  </td>
                </tr>
              )) : null}
            </tbody>
          </table>
        )}
      </section>

      {/* Right side: Analysis Panel */}
      {selectedDefect && (
        <section className="card" style={{ flex: 1, overflowY: 'auto', padding: '24px', borderLeft: '4px solid #0066ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>不具合分析</h3>
            <div>
              {isEditing ? (
                <>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ marginRight: '10px' }}>キャンセル</button>
                  <button className="btn-primary" onClick={handleSaveAnalysis}>保存</button>
                </>
              ) : (
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>分析情報を編集</button>
              )}
            </div>
          </div>

          <div className="analysis-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>不具合内容</label>
              <div style={{ marginTop: '5px' }}>{selectedDefect.description}</div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>不具合種別</label>
                <select 
                  disabled={!isEditing}
                  value={editData.defectType || ''}
                  onChange={e => setEditData({...editData, defectType: e.target.value})}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">未選択</option>
                  <option value="Bug">プログラムバグ</option>
                  <option value="Requirement">要件漏れ・誤解</option>
                  <option value="Design">設計不備</option>
                  <option value="Environment">環境起因</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>原因区分</label>
                <select 
                  disabled={!isEditing}
                  value={editData.causeCategory || ''}
                  onChange={e => setEditData({...editData, causeCategory: e.target.value})}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">未選択</option>
                  <option value="Logic">ロジック不備</option>
                  <option value="UI/UX">UI/UX・表示</option>
                  <option value="Data">データ不備</option>
                  <option value="Spec">仕様誤認</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>根本原因 (Root Cause)</label>
              <textarea 
                disabled={!isEditing}
                value={editData.rootCause || ''}
                onChange={e => setEditData({...editData, rootCause: e.target.value})}
                placeholder="なぜこの不具合が発生したのか、背後にある真の原因を記載してください。"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>再発防止策 (Improvement)</label>
              <textarea 
                disabled={!isEditing}
                value={editData.improvement || ''}
                onChange={e => setEditData({...editData, improvement: e.target.value})}
                placeholder="今後同様の不具合を防ぐための、具体的なプロセス改善や対策を記載してください。"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
              />
            </div>
            
            <div style={{ fontSize: '12px', color: '#999', textAlign: 'right' }}>
              ID: {selectedDefect.id} | 更新日: {new Date(selectedDefect.updatedAt).toLocaleString()}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DefectManager;
