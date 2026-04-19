import React, { useState, useEffect } from 'react';
import type { WeeklyReport } from '../../types/index';

interface WeeklyReportViewProps {
  apiBaseUrl: string;
  activeSystemId: string | null;
}

const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ apiBaseUrl, activeSystemId }) => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Partial<WeeklyReport> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    if (!activeSystemId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/weekly-reports?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setReports(data || []);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeSystemId]);

  const generateDraft = async () => {
    if (!activeSystemId) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/weekly-reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemId: activeSystemId }),
        credentials: 'include'
      });
      const draft = await res.json();
      setCurrentDraft(draft);
    } catch (err) {
      console.error('Failed to generate draft', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveReport = async () => {
    if (!currentDraft) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/weekly-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentDraft),
        credentials: 'include'
      });
      if (res.ok) {
        setCurrentDraft(null);
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>読み込み中...</div>;

  return (
    <div className="weekly-reports">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>週次進捗報告 (Weekly Report)</h2>
          <p style={{ color: 'var(--text-secondary)' }}>定例会議用の進捗資料を自動生成・管理します。</p>
        </div>
        <button className="btn-primary" onClick={generateDraft} disabled={isGenerating}>
          {isGenerating ? '分析中...' : '🪄 今週のレポートを自動作成'}
        </button>
      </div>

      {currentDraft && (
        <div className="card" style={{ marginBottom: '32px', border: '2px solid var(--accent-blue)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>週次報告書のドラフト (下書き)</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setCurrentDraft(null)}>破棄</button>
              <button className="btn-primary" onClick={saveReport}>この内容で保存・発行</button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>1. 今週の達成事項 (Achievements)</label>
              <textarea 
                className="form-input" 
                style={{ width: '100%', minHeight: '120px', fontFamily: 'inherit' }}
                value={currentDraft.achievements || ''}
                onChange={e => setCurrentDraft({...currentDraft, achievements: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>2. 課題・懸案事項 (Pending Issues)</label>
              <textarea 
                className="form-input" 
                style={{ width: '100%', minHeight: '120px', fontFamily: 'inherit' }}
                value={currentDraft.pendingIssues || ''}
                onChange={e => setCurrentDraft({...currentDraft, pendingIssues: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>3. 次週の予定 (Next Steps)</label>
              <input 
                type="text" 
                className="form-input" 
                value={currentDraft.nextSteps || ''} 
                onChange={e => setCurrentDraft({...currentDraft, nextSteps: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' }}>プロジェクト健康度</label>
              <select 
                className="form-input" 
                style={{ width: '200px' }}
                value={currentDraft.riskLevel}
                onChange={e => setCurrentDraft({...currentDraft, riskLevel: e.target.value})}
              >
                <option value="Success">Success (正常)</option>
                <option value="Warning">Warning (注意)</option>
                <option value="Critical">Critical (危険)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>報告履歴</h3>
        {reports.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>報告実績がありません。</div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="card" style={{ padding: '20px', borderLeft: `6px solid ${report.riskLevel === 'Critical' ? '#ef4444' : report.riskLevel === 'Warning' ? '#f59e0b' : '#10b981'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>第 {report.weekNumber} 週 報告 (開始日: {new Date(report.startDate).toLocaleDateString()})</div>
                <button className="btn-secondary" style={{ fontSize: '12px' }} onClick={() => window.print()}>PDF / 印刷可能</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>達成事項</div>
                  <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{report.achievements}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>懸案事項</div>
                  <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: report.riskLevel === 'Critical' ? '#ef4444' : 'inherit' }}>{report.pendingIssues}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WeeklyReportView;
