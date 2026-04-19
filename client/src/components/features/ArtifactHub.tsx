import React, { useState, useEffect } from 'react';
import type { Milestone, Deliverable } from '../../types/index';

interface ArtifactHubProps {
  apiBaseUrl: string;
  activeSystemId: string | null;
}

const ArtifactHub: React.FC<ArtifactHubProps> = ({ apiBaseUrl, activeSystemId }) => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArtifact, setNewArtifact] = useState({
    name: '',
    category: 'DesignDoc',
    description: '',
    milestoneId: '',
    externalUrl: '',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const fetchArtifacts = async () => {
    if (!activeSystemId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliverables?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setDeliverables(data || []);

      const mRes = await fetch(`${apiBaseUrl}/api/milestones?systemId=${activeSystemId}`, { credentials: 'include' });
      const mData = await mRes.json();
      setMilestones(mData || []);
    } catch (err) {
      console.error('Failed to fetch artifacts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, [activeSystemId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/api/deliverables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newArtifact, systemId: activeSystemId }),
        credentials: 'include'
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchArtifacts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, approvalStatus: string) => {
    try {
      await fetch(`${apiBaseUrl}/api/deliverables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus }),
        credentials: 'include'
      });
      fetchArtifacts();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>読み込み中...</div>;

  const categories = [
    { id: 'DesignDoc', label: '設計書 / ドキュメント' },
    { id: 'ReviewRecord', label: 'レビュー記録' },
    { id: 'Evidence', label: 'テスト証跡 / ログ' },
    { id: 'SourceCode', label: 'ソースコード / PR' },
    { id: 'UAT', label: '受入確認書 / 完了報告' }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Approved': return { bg: '#dcfce7', text: '#166534', label: '承認済' };
      case 'Reviewing': return { bg: '#fef9c3', text: '#854d0e', label: '確認中' };
      case 'Rejected': return { bg: '#fee2e2', text: '#991b1b', label: '差戻し' };
      default: return { bg: '#f1f5f9', text: '#475569', label: '下書き' };
    }
  };

  return (
    <div className="artifact-hub">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>成果物・ガバナンスハブ</h2>
          <p style={{ color: 'var(--text-secondary)' }}>プロジェクトの全工程における成果物の承認状況と証跡管理を行います。</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ 成果物の登録</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {categories.map(cat => {
          const items = deliverables.filter(d => d.category === cat.id);
          return (
            <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--hover-bg)', fontWeight: 'bold' }}>
                {cat.label} ({items.length})
              </div>
              <div style={{ flex: 1, padding: '12px' }}>
                {items.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>登録なし</div>
                ) : (
                  items.map(d => {
                    const status = getStatusColor(d.approvalStatus);
                    return (
                      <div key={d.id} style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', lastChild: { borderBottom: 'none' } as any }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>{d.name}</span>
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px', 
                            backgroundColor: status.bg, color: status.text, fontWeight: 'bold' 
                          }}>
                            {status.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          期限: {d.dueDate ? new Date(d.dueDate).toLocaleDateString() : '未設定'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {d.externalUrl && (
                            <a href={d.externalUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }}>
                              証跡を開く ↗
                            </a>
                          )}
                          {d.approvalStatus !== 'Approved' && (
                            <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => updateStatus(d.id, 'Approved')}>
                              承認
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: '500px', margin: 'auto' }}>
            <h2>成果物の新規登録</h2>
            <form onSubmit={handleSave}>
              <div style={{ margin: '1rem 0' }}>
                <label>名称</label>
                <input type="text" className="form-input" value={newArtifact.name} onChange={e => setNewArtifact({...newArtifact, name: e.target.value})} required placeholder="例: 基本設計書" />
              </div>
              <div style={{ margin: '1rem 0' }}>
                <label>カテゴリ</label>
                <select className="form-input" value={newArtifact.category} onChange={e => setNewArtifact({...newArtifact, category: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ margin: '1rem 0' }}>
                <label>関連マイルストーン</label>
                <select className="form-input" value={newArtifact.milestoneId} onChange={e => setNewArtifact({...newArtifact, milestoneId: e.target.value})}>
                  <option value="">なし</option>
                  {milestones.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ margin: '1rem 0' }}>
                <label>外部URL (証跡リンク)</label>
                <input type="url" className="form-input" value={newArtifact.externalUrl} onChange={e => setNewArtifact({...newArtifact, externalUrl: e.target.value})} placeholder="GitHub PR, SharePoint, etc." />
              </div>
              <div className="header-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>キャンセル</button>
                <button type="submit" className="btn-primary" style={{ marginLeft: '1rem' }}>登録</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactHub;
