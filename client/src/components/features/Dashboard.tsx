import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import type { Stats, TrendData } from '../../types';

interface DashboardProps {
  stats: Stats;
  trendData: TrendData;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, trendData }) => {
  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>テスト総数</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{stats.totalTests}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>実施済み</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>テスト合格率</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--primary-color)' }}>
            {stats.testPassRate.toFixed(1)}%
          </div>
          <div className="progress-bar" style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.testPassRate}%`, height: '100%', background: 'var(--primary-color)' }} />
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>未解決不具合</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: stats.openDefects > 0 ? 'var(--error-color)' : 'var(--success-color)' }}>
            {stats.openDefects}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>件</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>プロジェクト進捗</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {stats.progress.toFixed(1)}%
          </div>
          <div className="progress-bar" style={{ height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.progress}%`, height: '100%', background: '#10b981' }} />
          </div>
        </div>
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card ChartContainer">
          <h3 style={{ marginBottom: '1rem' }}>進捗管理 (バーンダウン)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.progressTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: '残課題数', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="remaining" stroke="var(--primary-color)" name="残課題数" strokeWidth={2} />
                <Line type="monotone" dataKey="ideal" stroke="#999" name="理想線" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card ChartContainer">
          <h3 style={{ marginBottom: '1rem' }}>品質分析 (不具合推移)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="defects" stroke="var(--error-color)" fill="var(--error-color)" fillOpacity={0.1} name="不具合累積" />
                <Line type="monotone" dataKey="passRate" stroke="var(--success-color)" name="合格率 (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
