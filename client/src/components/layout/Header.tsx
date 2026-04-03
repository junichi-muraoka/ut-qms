interface HeaderProps {
  activeTab: string;
  user: { email: string; name?: string; picture?: string } | null;
  onRefresh: () => void;
  onNew: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, user, onRefresh, onNew, onLogout }) => {
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
      <div className="header-left">
        <h1>{getTitle()}</h1>
      </div>
      
      <div className="header-right">
        <div className="header-actions">
          {activeTab !== 'dashboard' && (
            <>
              <button className="btn-secondary" onClick={onRefresh}>更新</button>
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

        {user && (
          <div className="user-profile" title={user.email} onClick={onLogout}>
            <div className="user-avatar">
              {user.picture ? (
                <img src={user.picture} alt={user.name} />
              ) : (
                <span>{user.name?.[0] || user.email[0].toUpperCase()}</span>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name || 'User'}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
