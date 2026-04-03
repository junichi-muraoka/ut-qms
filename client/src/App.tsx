import React, { useState, useEffect, useCallback } from 'react';
import type { 
  Priority, TestItem, Defect, Issue, Stats, TrendData 
} from './types';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Feature Components
import Dashboard from './components/features/Dashboard';
import TestManager from './components/features/TestManager';
import DefectManager from './components/features/DefectManager';
import IssueBoard from './components/features/IssueBoard';

// Common Components
import { AddIssueModal, AddDefectModal, AddTestItemModal } from './components/common/Modals';

const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  if (hostname.includes('develop.ut-qms.pages.dev')) {
    return 'https://qraft-staging.j-muraoka-secure.workers.dev';
  }
  return 'https://qraft.j-muraoka-secure.workers.dev';
})();

function App() {
  const [activeTab, setActiveTab] = useState('test-items');
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name?: string; picture?: string } | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddDefectForm, setShowAddDefectForm] = useState(false);
  const [showAddIssueForm, setShowAddIssueForm] = useState(false);
  
  const [newItem, setNewItem] = useState({ title: '', expectedResult: '', precondition: '' });
  const [newDefect, setNewDefect] = useState({ title: '', description: '', priority: 'Medium' as Priority, testItemId: '' });
  const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'Medium' as Priority });

  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    testPassRate: 0,
    openDefects: 0,
    progress: 0
  });

  const [trendData, setTrendData] = useState<TrendData>({
    progressTrend: [],
    qualityTrend: []
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google/login`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { credentials: 'include' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchTestItems = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items`, { credentials: 'include' });
      const data = await res.json();
      setTestItems(data.items || []);
    } catch (err) {
      console.error('Failed to fetch test items', err);
    }
  };

  const fetchDefects = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects`, { credentials: 'include' });
      const data = await res.json();
      setDefects(data.items || []);
    } catch (err) {
      console.error('Failed to fetch defects', err);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`, { credentials: 'include' });
      const data = await res.json();
      setIssues(data.items || []);
    } catch (err) {
      console.error('Failed to fetch issues', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`, { credentials: 'include' });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trends`, { credentials: 'include' });
      const data = await res.json();
      setTrendData(data);
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchTestItems();
      fetchDefects();
      fetchIssues();
      fetchStats();
      fetchTrends();
    }
  }, [user]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIssue, status: 'Todo' }),
        credentials: 'include'
      });
      if (res.ok) {
        setShowAddIssueForm(false);
        setNewIssue({ title: '', description: '', priority: 'Medium' });
        fetchIssues();
      }
    } catch (err) {
      console.error('Failed to create issue', err);
    }
  };

  const handleIssueStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchIssues();
      }
    } catch (err) {
      console.error('Failed to update issue status', err);
    }
  };

  const handleCreateDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDefect, status: 'Open' }),
        credentials: 'include'
      });
      if (res.ok) {
        setShowAddDefectForm(false);
        setNewDefect({ title: '', description: '', priority: 'Medium', testItemId: '' });
        fetchDefects();
      }
    } catch (err) {
      console.error('Failed to create defect', err);
    }
  };

  const handleDefectStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchDefects();
      }
    } catch (err) {
      console.error('Failed to update defect status', err);
    }
  };

  const handleCreateTestItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, status: 'NoRun' }),
        credentials: 'include'
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewItem({ title: '', expectedResult: '', precondition: '' });
        fetchTestItems();
      }
    } catch (err) {
      console.error('Failed to create test item', err);
    }
  };

  const handleTestStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        fetchTestItems();
      }
    } catch (err) {
      console.error('Failed to update test status', err);
    }
  };

  const onRefresh = () => {
    if (activeTab === 'dashboard') { fetchStats(); fetchTrends(); }
    else if (activeTab === 'test-items') fetchTestItems();
    else if (activeTab === 'defects') fetchDefects();
    else fetchIssues();
  };

  if (isLoading) {
    return <div className="loading-container">読み込み中...</div>;
  }

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>Qraft</h1>
          <p>品質管理を、もっとスマートに。</p>
          <button className="btn-primary login-btn" onClick={handleLogin}>
            Google アカウントでログイン
          </button>
          <p className="login-footer">※ クレジットカード登録不要のセキュアログイン</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header 
          activeTab={activeTab} 
          user={user} 
          onRefresh={onRefresh}
          onLogout={handleLogout}
          onNew={() => {
            if (activeTab === 'test-items') setShowAddForm(true);
            else if (activeTab === 'defects') setShowAddDefectForm(true);
            else setShowAddIssueForm(true);
          }}
        />

        {showAddIssueForm && (
          <AddIssueModal 
            newIssue={newIssue} 
            setNewIssue={setNewIssue} 
            onSave={handleCreateIssue} 
            onClose={() => setShowAddIssueForm(false)} 
          />
        )}

        {showAddDefectForm && (
          <AddDefectModal 
            newDefect={newDefect} 
            setNewDefect={setNewDefect} 
            testItems={testItems} 
            onSave={handleCreateDefect} 
            onClose={() => setShowAddDefectForm(false)} 
          />
        )}

        {showAddForm && (
          <AddTestItemModal 
            newItem={newItem} 
            setNewItem={setNewItem} 
            onSave={handleCreateTestItem} 
            onClose={() => setShowAddForm(false)} 
          />
        )}

        <main className="content-area">
          {activeTab === 'dashboard' && <Dashboard stats={stats} trendData={trendData} />}
          {activeTab === 'test-items' && <TestManager testItems={testItems} loading={false} onStatusChange={handleTestStatusChange} />}
          {activeTab === 'defects' && <DefectManager defects={defects} loading={false} onStatusChange={handleDefectStatusChange} />}
          {activeTab === 'issues' && <IssueBoard issues={issues} loading={false} onStatusChange={handleIssueStatusChange} />}
        </main>
      </div>
    </div>
  );
}

export default App;
