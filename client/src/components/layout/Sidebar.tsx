import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      <div className="logo">Qraft</div>
      <nav>
        <ul className="nav-links">
          <li 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            ダッシュボード
          </li>
          <li 
            className={`nav-item ${activeTab === 'test-items' ? 'active' : ''}`}
            onClick={() => setActiveTab('test-items')}
          >
            テスト項目書
          </li>
          <li 
            className={`nav-item ${activeTab === 'defects' ? 'active' : ''}`}
            onClick={() => setActiveTab('defects')}
          >
            不具合管理
          </li>
          <li 
            className={`nav-item ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            課題管理
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
