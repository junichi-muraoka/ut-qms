import React from 'react';

interface HeaderProps {
  activeTab: string;
  onRefresh: () => void;
  onNew: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onRefresh, onNew }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'test-items': return 'テスト項目管理';
      case 'dashboard': return '総合ダッシュボード';
      case 'defects': return '不具合一覧';
      case 'issues': return '課題一覧';
      default: return 'Qraft';
    }
  };

  return (
    <header className="header">
      <h1>{getTitle()}</h1>
      <div className="header-actions">
        {activeTab !== 'dashboard' && (
          <>
            <button className="btn-primary" onClick={onRefresh}>更新</button>
            <button 
              className="btn-primary" 
              style={{ marginLeft: '10px' }} 
              onClick={onNew}
            >
              + 新規作成
            </button>
          </>
        )}
        {activeTab === 'dashboard' && (
           <button className="btn-primary" onClick={onRefresh}>ダッシュボード更新</button>
        )}
      </div>
    </header>
  );
};

export default Header;
