import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import type { Stats, TrendData } from '../../types';

interface DashboardProps {
  stats: Stats;
  trendData: TrendData;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, trendData }) => {
  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-label">総テスト件数</div>
          <div className="stat-value">{stats.totalTests}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">パス率</div>
          <div className="stat-value">{stats.testPassRate.toFixed(1)}%</div>
          <div className="stat-progress-bg">
            <div className="stat-progress-bar" style={{ width: `${stats.testPassRate}%` }}></div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">未解決の不具合</div>
          <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats.openDefects}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">開発進捗</div>
          <div className="stat-value">{stats.progress.toFixed(1)}%</div>
          <div className="stat-progress-bg">
            <div className="stat-progress-bar" style={{ width: `${stats.progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h3>進捗トレンド (バーンダウン予想)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(trendData?.progressTrend) ? trendData.progressTrend : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="残り課題量" />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="理想線" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3>品質トレンド (累積不具合数とパス率)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.isArray(trendData?.qualityTrend) ? trendData.qualityTrend : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="defects" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={2} name="累積不具合" />
                <Line type="monotone" dataKey="passRate" stroke="#10b981" strokeWidth={2} name="テストパス率" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
