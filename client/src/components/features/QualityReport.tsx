import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { QualitySummary, TrendData } from '../../types/index';

interface QualityReportProps {
  apiBaseUrl: string;
  trendData: TrendData;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const QualityReport: React.FC<QualityReportProps> = ({ apiBaseUrl, trendData }) => {
  const [summary, setSummary] = useState<QualitySummary | null>(null);
  const [verdict, setVerdict] = useState({ id: '', verdictText: '', author: '' });
  const [isEditingVerdict, setIsEditingVerdict] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const summaryRes = await fetch(`${apiBaseUrl}/api/reports/quality-summary`, { credentials: 'include' });
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const verdictRes = await fetch(`${apiBaseUrl}/api/reports/verdict`, { credentials: 'include' });
      const verdictData = await verdictRes.json();
      setVerdict(verdictData);
    } catch (err) {
      console.error('Failed to fetch quality data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveVerdict = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/reports/verdict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verdict),
        credentials: 'include'
      });
      if (res.ok) setIsEditingVerdict(false);
    } catch (err) {
      alert('判定の保存に失敗しました');
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (isLoading) return <div className="p-8">レポート生成中...</div>;
  if (!summary) return <div className="p-8">データの取得に失敗しました。</div>;

  const typeData = Object.entries(summary.defectTypeDist).map(([name, value]) => ({ name, value }));
  const causeData = Object.entries(summary.causeDist).map(([name, value]) => ({ name, value }));

  return (
    <div className="quality-report printable-area" style={{ paddingBottom: '40px' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .printable-area { padding: 0 !important; width: 100% !important; }
          .sidebar, .header, .header-actions { display: none !important; }
          .card { box-shadow: none !important; border: 1px solid #eee !important; page-break-inside: avoid; }
          body { background: #fff !important; }
          h1 { font-size: 24pt !important; }
          .main-content { padding: 0 !important; }
          .app-container { display: block !important; }
        }
      `}</style>

      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>
            品質結果報告書 <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 'normal' }}>(Quality Result Report)</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>本プロジェクトの品質分析および最終判定結果の公式記録</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => window.print()} className="btn-secondary no-print" style={{ marginBottom: '10px' }}>PDF / 印刷出力</button>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>報告日: {new Date().toLocaleDateString()}</div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>最終データ同期: {new Date(summary.updatedAt).toLocaleString()}</div>
        </div>
      </header>

      {/* 1. Final Verdict Section - THE MOST IMPORTANT PART */}
      <section className="card" style={{ marginBottom: '32px', border: '2px solid #3b82f6', borderLeftWidth: '8px' }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3b82f6' }}>■</span> 品質最終判定 (Final Verdict)
            </h2>
            <button 
              className="btn-secondary no-print" 
              onClick={() => isEditingVerdict ? saveVerdict() : setIsEditingVerdict(true)}
            >
              {isEditingVerdict ? '判定を保存する' : '判定を編集する'}
            </button>
          </div>
          
          {isEditingVerdict ? (
            <div>
              <textarea 
                className="form-input" 
                style={{ width: '100%', minHeight: '150px', marginBottom: '1rem', fontSize: '16px' }}
                value={verdict.verdictText}
                onChange={(e) => setVerdict({ ...verdict, verdictText: e.target.value })}
                placeholder="品質の承認理由、合格/不合格の最終判断、今後の課題などを記入してください..."
              />
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '200px' }}
                value={verdict.author}
                onChange={(e) => setVerdict({ ...verdict, author: e.target.value })}
                placeholder="記入者名"
              />
            </div>
          ) : (
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {verdict.verdictText || '※品質判定が未記入です。編集ボタンから最終判定を入力してください。'}
              <div style={{ marginTop: '16px', textAlign: 'right', fontWeight: 'bold' }}>
                承認担当: {verdict.author || '---'}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Key Metrics Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>不具合密度</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{summary.defectDensity}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>件 / 100ケース</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>テストパス率</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{summary.totalTests > 0 ? ((summary.passedTests / summary.totalTests) * 100).toFixed(1) : 0}%</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{summary.passedTests} / {summary.totalTests} 件完了</div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>不具合収束率</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{summary.totalDefects > 0 ? ((summary.closedDefects / summary.totalDefects) * 100).toFixed(1) : 0}%</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{summary.closedDefects} / {summary.totalDefects} 件クローズ</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>不具合カテゴリ分布</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>根本原因分析</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={causeData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Traceability Table - OFFICIAL PROOF */}
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>■ 工程別トレーサビリティ詳細 (Traceability Matrix)</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ width: '20%' }}>マイルストーン (工程)</th>
                <th style={{ width: '40%' }}>テスト項目 (証跡)</th>
                <th style={{ width: '10%' }}>判定</th>
                <th style={{ width: '30%' }}>関連不具合</th>
              </tr>
            </thead>
            <tbody>
              {summary.traceability && summary.traceability.map((m, mIdx) => (
                <React.Fragment key={mIdx}>
                  <tr style={{ backgroundColor: '#f3f4f6', fontWeight: 'bold' }}>
                    <td>{m.milestoneName}</td>
                    <td colSpan={3}>
                      {m.passedTests} / {m.totalTests} ケース合格 ({m.totalTests > 0 ? (m.passedTests/m.totalTests*100).toFixed(0) : 0}%)
                    </td>
                  </tr>
                  {m.tests.map((t, tIdx) => (
                    <tr key={tIdx}>
                      <td style={{ color: '#94a3b8', fontSize: '11px' }}>↳ 同工程内</td>
                      <td>{t.title}</td>
                      <td>
                        <span className={`badge ${t.status === 'Pass' ? 'badge-pass' : t.status === 'Fail' ? 'badge-fail' : 'badge-norun'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        {t.defects.length > 0 ? t.defects.map((d: any, dIdx: number) => (
                          <div key={dIdx} style={{ fontSize: '11px', color: d.status === 'Closed' ? '#10b981' : '#ef4444' }}>
                            • {d.title} ({d.status})
                          </div>
                        )) : <span style={{ color: '#cbd5e1' }}>なし</span>}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer for formal report */}
      <footer style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
        <p>Qraft Quality Management Suite - Official Audit Document</p>
        <p>© {new Date().getFullYear()} Junichi Muraoka / ut-qms Project</p>
      </footer>
    </div>
  );
};

export default QualityReport;
