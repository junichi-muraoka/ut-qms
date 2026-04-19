import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Milestone, Issue } from '../../types/index';

interface TimelineViewProps {
  currentSystemMilestones: Milestone[];
  apiBaseUrl: string;
}

const TimelineView: React.FC<TimelineViewProps> = ({ currentSystemMilestones, apiBaseUrl }) => {
  const [viewMode, setViewMode] = useState<'system' | 'program'>('system');
  const [allMilestones, setAllMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // フェッチ処理: Program View の場合は全系統のマイルストーンを取得
  useEffect(() => {
    if (viewMode === 'program') {
      setIsLoading(true);
      fetch(`${apiBaseUrl}/api/milestones`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setAllMilestones(data || []))
        .finally(() => setIsLoading(false));
    }
  }, [viewMode, apiBaseUrl]);

  const displayMilestones = viewMode === 'system' ? currentSystemMilestones : allMilestones;

  // タイムラインの期間計算 (全表示データの最小開始日〜最大完了日)
  const { startDate, endDate, daysGrid } = useMemo(() => {
    if (displayMilestones.length === 0) {
      const today = new Date();
      return { startDate: today, endDate: today, daysGrid: [] };
    }
    const dates = displayMilestones.flatMap(m => [new Date(m.startDate || ''), new Date(m.dueDate || '')]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // 前後に少しバッファを持たせる
    start.setDate(1); 
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    const days = [];
    let curr = new Date(start);
    while (curr <= end) {
      days.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return { startDate: start, endDate: end, daysGrid: days };
  }, [displayMilestones]);

  const dayWidth = 32;

  const getDayOffset = (dateStr?: string) => {
    if (!dateStr) return -1;
    const date = new Date(dateStr);
    const diffTime = date.getTime() - startDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // 依存関係の線を描画するための座標計算
  const renderDependencyLines = () => {
    if (viewMode !== 'program') return null;
    
    return (
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
        {displayMilestones.filter(m => m.dependsOnMilestoneId).map(m => {
          const parent = displayMilestones.find(p => p.id === m.dependsOnMilestoneId);
          if (!parent) return null;

          const parentIndex = displayMilestones.indexOf(parent);
          const childIndex = displayMilestones.indexOf(m);
          
          const startX = (getDayOffset(parent.dueDate) + 1) * dayWidth;
          const startY = parentIndex * 64 + 32;
          const endX = getDayOffset(m.startDate) * dayWidth;
          const endY = childIndex * 64 + 32;

          // 遅延している場合は線を赤くする
          const isWarning = parent.status === 'Delayed';

          return (
            <path
              key={`${parent.id}-${m.id}`}
              d={`M ${startX} ${startY} C ${startX + 40} ${startY}, ${endX - 40} ${endY}, ${endX} ${endY}`}
              fill="none"
              stroke={isWarning ? '#ef4444' : '#94a3b8'}
              strokeWidth={isWarning ? "2" : "1"}
              strokeDasharray={isWarning ? "4" : "0"}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Control Bar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--hover-bg)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>タイムライン・ガント</h2>
          {isLoading && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>データ読込中...</span>}
        </div>
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setViewMode('system')}
            style={{ 
              padding: '6px 16px', borderRadius: '6px', fontSize: '13px', border: 'none',
              backgroundColor: viewMode === 'system' ? 'var(--bg-primary)' : 'transparent',
              color: viewMode === 'system' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              boxShadow: viewMode === 'system' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer'
            }}
          >
            システム単体
          </button>
          <button 
            onClick={() => setViewMode('program')}
            style={{ 
              padding: '6px 16px', borderRadius: '6px', fontSize: '13px', border: 'none',
              backgroundColor: viewMode === 'program' ? 'var(--bg-primary)' : 'transparent',
              color: viewMode === 'program' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              boxShadow: viewMode === 'program' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer'
            }}
          >
            全系統俯瞰 (Program)
          </button>
        </div>
      </div>

      {/* Gantt Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: System/Milestone Name */}
        <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border-color)', overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ height: '60px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--hover-bg)' }}></div>
          {displayMilestones.map(m => (
            <div key={m.id} style={{ height: '64px', padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                 {viewMode === 'program' && <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'block' }}>SYSTEM: {m.systemId?.substring(0,8)}</span>}
                 {m.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{m.startDate} 〜 {m.dueDate}</div>
            </div>
          ))}
        </div>

        {/* Right Side: Timeline Grid */}
        <div ref={containerRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          {/* Timeline Header (Dates) */}
          <div style={{ display: 'flex', height: '60px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--hover-bg)', position: 'sticky', top: 0, zIndex: 20 }}>
            {daysGrid.map((date, i) => {
              const dateKey = date.toISOString().split('T')[0];
              const isFirstOfMonth = date.getDate() === 1;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div key={dateKey} style={{ width: `${dayWidth}px`, flexShrink: 0, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: isWeekend ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                  {isFirstOfMonth && <div style={{ position: 'absolute', top: 4, fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{date.getMonth() + 1}月</div>}
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{date.getDate()}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>{['日','月','火','水','木','金','土'][date.getDay()]}</span>
                </div>
              );
            })}
          </div>

          {/* Timeline Content Rows */}
          <div style={{ position: 'relative' }}>
             {/* Dependency Lines Layer */}
             {renderDependencyLines()}

             {displayMilestones.map(m => {
               const startOffset = getDayOffset(m.startDate);
               const endOffset = getDayOffset(m.dueDate);
               const duration = endOffset - startOffset + 1;

               return (
                 <div key={m.id} style={{ height: '64px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                    {/* Background Grid Lines */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', pointerEvents: 'none' }}>
                      {daysGrid.map((_, i) => (
                        <div key={i} style={{ width: `${dayWidth}px`, flexShrink: 0, borderRight: '1px solid var(--border-color)' }} />
                      ))}
                    </div>

                    {/* Milestone Bar */}
                    {startOffset >= 0 && (
                      <div style={{
                        position: 'absolute',
                        left: `${startOffset * dayWidth + 4}px`,
                        width: `${duration * dayWidth - 8}px`,
                        top: '16px',
                        height: '32px',
                        backgroundColor: m.status === 'Completed' ? '#10b981' : m.status === 'Delayed' ? '#ef4444' : 'var(--accent-blue)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        zIndex: 5
                      }}>
                        {m.name}
                        {m.status === 'Delayed' && <span style={{ marginLeft: '4px' }}>⚠️</span>}
                      </div>
                    )}
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
