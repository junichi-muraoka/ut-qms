import React from 'react';
import type { Issue } from '../../types';

interface IssueBoardProps {
  issues: Issue[];
  loading: boolean;
  onStatusChange: (id: string, newStatus: string) => void;
}

const IssueBoard: React.FC<IssueBoardProps> = ({ issues, loading, onStatusChange }) => {
  const statuses = ['Todo', 'InProgress', 'Done'];

  return (
    <section className="card">
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="kanban-board" style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
          {statuses.map(status => (
            <div key={status} className="kanban-column" style={{ flex: 1, minWidth: '250px', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>{
                status === 'Todo' ? '未着手' : 
                status === 'InProgress' ? '進行中' : '完了'
              }</h3>
              {Array.isArray(issues) ? issues.filter((i) => i.status === status).map((issue) => (
                <div key={issue.id} className="card" style={{ marginBottom: '0.5rem', padding: '1rem', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{issue.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{issue.description}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span className={`priority priority-${issue.priority.toLowerCase()}`} style={{ fontSize: '0.75rem' }}>
                      {issue.priority === 'Critical' ? '最優先' : 
                       issue.priority === 'High' ? '高' : 
                       issue.priority === 'Medium' ? '中' : '低'}
                    </span>
                  </div>
                  <select 
                    style={{ width: '100%', marginTop: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px' }}
                    value={issue.status}
                    onChange={(e) => onStatusChange(issue.id, e.target.value)}
                  >
                    <option value="Todo">未着手</option>
                    <option value="InProgress">進行中</option>
                    <option value="Done">完了</option>
                  </select>
                </div>
              )) : null}
              {issues.filter((i) => i.status === status).length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>
                  アイテムなし
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default IssueBoard;
