import React, { useState, useEffect } from 'react';
import { useSystem } from '../../contexts/SystemContext';

interface GlobalSummary {
  id: string;
  name: string;
  pmName: string;
  color: string;
  progress: string;
  density: string;
  passRate: string;
  totalDefects: number;
  riskLevel: 'Success' | 'Warning' | 'Critical';
  currentPhase: string;
}

const getPhaseLabel = (phase: string) => {
  const mapping: Record<string, string> = {
    'Requirements': '要件定義',
    'BasicDesign': '基本設計',
    'DetailDesign': '詳細設計',
    'Build': '製造',
    'UT': '単体テスト',
    'IT-A': '内部結合',
    'IT-B': '外部結合',
    'ST-F': 'システム機能',
    'PerfLoad': '性能・負荷',
    'SecRecov': 'セキュリティ',
    'OperMig': '移行・運用',
    'UAT': '受入テスト',
    'Cutover': '本番切替'
  };
  return mapping[phase] || phase;
};

const ProgramTower: React.FC<{ apiBaseUrl: string; setActiveTab: (tab: string) => void }> = ({ apiBaseUrl, setActiveTab }) => {
  const [summaries, setSummaries] = useState<GlobalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setActiveSystemId } = useSystem();

  const fetchGlobalSummary = React.useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/program/summary`, { credentials: 'include' });
      const data = await res.json();
      setSummaries(data);
    } catch (err) {
      console.error('Failed to fetch program summary', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchGlobalSummary();
  }, [fetchGlobalSummary]);

  const handleSystemClick = (systemId: string) => {
    setActiveSystemId(systemId);
    setActiveTab('dashboard');
  };

  if (isLoading) return <div className="p-8">全系統データ集計中...</div>;

  return (
    <div className="program-tower" style={{ padding: '24px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>プログラム管制塔 (Program Tower)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>全 {summaries.length} システムの進捗および品質状況のリアルタイム監視</p>
      </header>

      {/* Global Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>監視対象システム</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{summaries.length}</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>平均進捗率</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {(summaries.reduce((acc, s) => acc + Number(s.progress), 0) / (summaries.length || 1)).toFixed(1)}%
          </div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>累積不具合数</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-red)' }}>
            {summaries.reduce((acc, s) => acc + s.totalDefects, 0)}
          </div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>要配慮システム</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-red)' }}>
            {summaries.filter(s => s.riskLevel === 'Critical').length}
          </div>
        </div>
      </div>

      {/* Program List Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--hover-bg)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px' }}>システム名</th>
              <th style={{ textAlign: 'left', padding: '16px' }}>現在の工程</th>
              <th style={{ textAlign: 'left', padding: '16px' }}>担当 PM</th>
              <th style={{ textAlign: 'left', padding: '16px' }}>進捗率</th>
              <th style={{ textAlign: 'left', padding: '16px' }}>不具合密度</th>
              <th style={{ textAlign: 'left', padding: '16px' }}>リスク</th>
              <th style={{ textAlign: 'center', padding: '16px' }}>アクション</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }}></div>
                    {s.name}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    color: 'var(--accent-blue)',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    {getPhaseLabel(s.currentPhase)}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{s.pmName || '未割当'}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ width: '100px', backgroundColor: 'var(--border-color)', height: '6px', borderRadius: '3px', marginBottom: '4px' }}>
                    <div style={{ width: `${s.progress}%`, backgroundColor: 'var(--accent-blue)', height: '100%', borderRadius: '3px' }}></div>
                  </div>
                  <span style={{ fontSize: '12px' }}>{s.progress}%</span>
                </td>
                <td style={{ padding: '16px' }}>{s.density}</td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge ${s.riskLevel === 'Critical' ? 'badge-fail' : s.riskLevel === 'Warning' ? 'badge-norun' : 'badge-pass'}`}>
                    {s.riskLevel}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button onClick={() => handleSystemClick(s.id)} className="btn-secondary" style={{ fontSize: '12px', padding: '4px 12px' }}>
                    詳細へ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramTower;
