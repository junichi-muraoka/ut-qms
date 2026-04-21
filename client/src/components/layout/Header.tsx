interface HeaderProps {
  activeTab: string;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  user: { email: string; name?: string; picture?: string } | null;
  onRefresh: () => void;
  onNew: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, theme, setTheme, user, onRefresh, onNew, onLogout }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'program-tower': return 'プログラム管制塔 (Program Tower)';
      case 'dashboard': return 'プロジェクト概要 (Dashboard)';
      case 'test-items': return 'テスト項目書 (Test Cases)';
      case 'defects': return '不具合管理 (Defects)';
      case 'issues': return '課題ボード (Issues)';
      case 'wiki': return 'プロジェクト Wiki';
      case 'artifacts': return '成果物ハブ (Artifact Hub)';
      case 'reviews': return '品質管理・レビュー記録';
      case 'reports': return '品質分析レポート';
      case 'timeline': return '統合タイムライン・ガントチャート';
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

          {/* Theme Toggle */}
          <button 
            className="btn-secondary" 
            style={{ 
              marginLeft: '15px', 
              width: '40px', 
              height: '40px', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={theme === 'light' ? 'ダークモードへ' : 'ライトモードへ'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1m-16 0h1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        {user && (
          <div className="user-section">
            <div className="user-profile" title={user.email}>
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
            <button className="logout-btn" onClick={onLogout}>ログアウト</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
