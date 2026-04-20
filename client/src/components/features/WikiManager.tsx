import React, { useState, useEffect } from 'react';
import type { Document } from '../../types/index';

interface WikiManagerProps {
  apiBaseUrl: string;
}

const WikiManager: React.FC<WikiManagerProps> = ({ apiBaseUrl }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = React.useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/documents`, { credentials: 'include' });
      const data = await res.json();
      setDocuments(data.items || []);
      if (data.items?.length > 0 && !selectedDoc) {
        setSelectedDoc(data.items[0]);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, selectedDoc]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSave = async () => {
    if (!selectedDoc) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/documents/${selectedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        setDocuments(documents.map(d => d.id === updated.id ? updated : d));
        setSelectedDoc(updated);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to save document', err);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新規ドキュメント',
          content: '# 新しいドキュメント\n内容をここに記述してください。',
          category: 'Other',
        }),
        credentials: 'include',
      });
      if (res.ok) {
        const created = await res.json();
        setDocuments([created, ...documents]);
        setSelectedDoc(created);
        setIsEditing(true);
        setEditTitle(created.title);
        setEditContent(created.content || '');
      }
    } catch (err) {
      console.error('Failed to create document', err);
    }
  };

  if (isLoading) return <div className="p-8">読み込み中...</div>;

  return (
    <div className="wiki-container" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '20px' }}>
      {/* Sidebar List */}
      <div className="wiki-sidebar" style={{ width: '250px', borderRight: '1px solid #eee', paddingRight: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>ドキュメント</h3>
          <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={handleCreate}>新規</button>
        </div>
        <div className="wiki-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`wiki-item ${selectedDoc?.id === doc.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedDoc(doc);
                setIsEditing(false);
              }}
              style={{
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedDoc?.id === doc.id ? '#f0f7ff' : 'transparent',
                color: selectedDoc?.id === doc.id ? '#0066ff' : '#333',
                fontSize: '14px',
                fontWeight: selectedDoc?.id === doc.id ? '600' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {doc.title}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="wiki-content" style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
        {selectedDoc ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ fontSize: '24px', fontWeight: 'bold', border: 'none', borderBottom: '2px solid #0066ff', outline: 'none', width: '70%', background: 'transparent' }}
                />
              ) : (
                <h2 style={{ margin: 0 }}>{selectedDoc.title}</h2>
              )}
              
              <div>
                {isEditing ? (
                  <>
                    <button className="btn-secondary" style={{ marginRight: '10px' }} onClick={() => setIsEditing(false)}>キャンセル</button>
                    <button className="btn-primary" onClick={handleSave}>保存</button>
                  </>
                ) : (
                  <button className="btn-secondary" onClick={() => {
                    setIsEditing(true);
                    setEditTitle(selectedDoc.title);
                    setEditContent(selectedDoc.content || '');
                  }}>編集</button>
                )}
              </div>
            </div>

            <div className="wiki-body">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{
                    width: '100%',
                    height: '500px',
                    padding: '15px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  placeholder="Markdownで記述..."
                />
              ) : (
                <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', color: '#444' }}>
                  {selectedDoc?.content || '内容がありません。'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
            ドキュメントを選択するか、新しく作成してください。
          </div>
        )}
      </div>
    </div>
  );
};

export default WikiManager;
