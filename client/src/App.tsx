import React, { useState, useEffect, useCallback } from 'react';
import type { 
  TestItem, Defect, Issue, Stats, TrendData, Milestone, 
  MilestoneInput, IssueInput, DefectInput, TestItemInput 
} from './types/index';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Feature Components
import Dashboard from './components/features/Dashboard';
import TestManager from './components/features/TestManager';
import DefectManager from './components/features/DefectManager';
import IssueBoard from './components/features/IssueBoard';
import WikiManager from './components/features/WikiManager';
import ReviewManager from './components/features/ReviewManager';
import QualityReport from './components/features/QualityReport';
import TimelineView from './components/features/TimelineView';
import WeeklyReportView from './components/features/WeeklyReportView';
import ArtifactHub from './components/features/ArtifactHub';
import ProgramTower from './components/features/ProgramTower';
import { SystemProvider } from './contexts/SystemProvider';
import { useSystem } from './contexts/SystemContext';

// Common Components
import { AddIssueModal, AddDefectModal, AddTestItemModal, AddMilestoneModal } from './components/common/Modals';

const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Relative path to utilize Vite proxy for stable cookie/CORS handling
    return '';
  }
  if (hostname.includes('develop.qraft.pages.dev') || hostname.includes('develop.ut-qms.pages.dev')) {
    return 'https://qraft-staging.j-muraoka-secure.workers.dev';
  }
  return 'https://qraft.j-muraoka-secure.workers.dev';
})();

function App() {
  return (
    <SystemProvider apiBaseUrl={API_BASE_URL}>
      <AppContent />
    </SystemProvider>
  );
}

function AppContent() {
  const { activeSystemId } = useSystem();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name?: string; picture?: string } | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddDefectForm, setShowAddDefectForm] = useState(false);
  const [showAddIssueForm, setShowAddIssueForm] = useState(false);
  const [showAddMilestoneForm, setShowAddMilestoneForm] = useState(false);
  
  const [newItem, setNewItem] = useState<TestItemInput>({ title: '', expectedResult: '', precondition: '' });
  const [newDefect, setNewDefect] = useState<DefectInput>({ title: '', description: '', priority: 'Medium', testItemId: '' });
  const [newIssue, setNewIssue] = useState<IssueInput>({ title: '', description: '', priority: 'Medium', startDate: '', dueDate: '', milestoneId: '' });
  const [newMilestone, setNewMilestone] = useState<MilestoneInput>({ name: '', startDate: '', dueDate: '', description: '', category: '', dependsOnMilestoneId: '' });

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

  const fetchTestItems = useCallback(async () => {
    if (!activeSystemId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setTestItems(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [activeSystemId]);

  const fetchDefects = useCallback(async () => {
    if (!activeSystemId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setDefects(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [activeSystemId]);

  const fetchIssues = useCallback(async () => {
    if (!activeSystemId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setIssues(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [activeSystemId]);

  const fetchStats = useCallback(async () => {
    if (!activeSystemId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setStats(data && typeof data === 'object' && 'totalTests' in data ? data : {
        totalTests: 0,
        testPassRate: 0,
        openDefects: 0,
        progress: 0
      });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, [activeSystemId]);

  const fetchTrends = useCallback(async () => {
    if (!activeSystemId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/trends?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setTrendData(data && typeof data === 'object' && 'progressTrend' in data ? data : {
        progressTrend: [],
        qualityTrend: []
      });
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  }, [activeSystemId]);

  const fetchReviews = useCallback(async () => {
    // Current ReviewManager fetches its own data, but we can pre-fetch or trigger it here if needed
  }, []);

  const fetchMilestones = useCallback(async () => {
    if (!activeSystemId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/milestones?systemId=${activeSystemId}`, { credentials: 'include' });
      const data = await res.json();
      setMilestones(data || []);
    } catch (err) {
      console.error('Failed to fetch milestones', err);
    }
  }, [activeSystemId]);

  const onRefresh = useCallback(() => {
    if (activeTab === 'dashboard') { fetchStats(); fetchTrends(); }
    else if (activeTab === 'test-items') fetchTestItems();
    else if (activeTab === 'defects') fetchDefects();
    else if (activeTab === 'issues') fetchIssues();
    else if (activeTab === 'reviews') fetchReviews();
    else if (activeTab === 'reports') { /* Report has its own internal fetch */ }
    else if (activeTab === 'timeline') { fetchIssues(); fetchMilestones(); }
    else if (activeTab === 'artifacts') { /* Internal fetch in component */ }
    else if (activeTab === 'weekly-reports') { /* Internal fetch in component */ }
  }, [activeTab, fetchStats, fetchTrends, fetchTestItems, fetchDefects, fetchIssues, fetchReviews, fetchMilestones]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (activeSystemId) {
      onRefresh();
    }
  }, [activeTab, activeSystemId, onRefresh]);

  useEffect(() => {
    if (user && activeSystemId) {
      fetchTestItems();
      fetchDefects();
      fetchIssues();
      fetchStats();
      fetchTrends();
      fetchMilestones();
    }
  }, [user, activeSystemId, fetchTestItems, fetchDefects, fetchIssues, fetchStats, fetchTrends, fetchMilestones]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIssue, status: 'Todo', systemId: activeSystemId }),
        credentials: 'include'
      });
      if (res.ok) {
        setShowAddIssueForm(false);
        setNewIssue({ title: '', description: '', priority: 'Medium', startDate: '', dueDate: '', milestoneId: '' });
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
        body: JSON.stringify({ status: newStatus, systemId: activeSystemId }),
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
        body: JSON.stringify({ ...newDefect, status: 'Open', systemId: activeSystemId }),
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
        body: JSON.stringify({ status: newStatus, systemId: activeSystemId }),
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
        body: JSON.stringify({ ...newItem, status: 'NoRun', systemId: activeSystemId }),
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

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMilestone, systemId: activeSystemId }),
        credentials: 'include'
      });
      if (res.ok) {
        setShowAddMilestoneForm(false);
        setNewMilestone({ name: '', startDate: '', dueDate: '', description: '', category: '', dependsOnMilestoneId: '' });
        fetchMilestones();
      }
    } catch (err) {
      console.error('Failed to create milestone', err);
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

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

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
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" data-theme={theme}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header 
          activeTab={activeTab} 
          theme={theme}
          setTheme={setTheme}
          user={user} 
          onRefresh={onRefresh}
          onLogout={handleLogout}
          onNew={() => {
            if (activeTab === 'test-items') setShowAddForm(true);
            else if (activeTab === 'defects') setShowAddDefectForm(true);
            else if (activeTab === 'timeline') setShowAddMilestoneForm(true);
            else setShowAddIssueForm(true);
          }}
        />

        {showAddIssueForm && (
          <AddIssueModal 
            newIssue={newIssue} 
            setNewIssue={setNewIssue} 
            milestones={milestones}
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
        {showAddMilestoneForm && (
          <AddMilestoneModal 
            newMilestone={newMilestone} 
            setNewMilestone={setNewMilestone} 
            allMilestones={milestones} // Ideally fetch all for dependency selection
            onSave={handleCreateMilestone} 
            onClose={() => setShowAddMilestoneForm(false)} 
          />
        )}

        <main className="content-area">
          {activeTab === 'program-tower' && <ProgramTower apiBaseUrl={API_BASE_URL} setActiveTab={setActiveTab} />}
          {activeTab === 'dashboard' && <Dashboard stats={stats} trendData={trendData} />}
          {activeTab === 'test-items' && <TestManager testItems={testItems} loading={false} onStatusChange={handleTestStatusChange} />}
          {activeTab === 'defects' && (
            <DefectManager 
              apiBaseUrl={API_BASE_URL} 
              defects={defects} 
              loading={false} 
              onStatusChange={handleDefectStatusChange} 
              onRefresh={fetchDefects}
            />
          )}
          {activeTab === 'issues' && <IssueBoard issues={issues} loading={false} onStatusChange={handleIssueStatusChange} />}
          {activeTab === 'wiki' && <WikiManager apiBaseUrl={API_BASE_URL} />}
          {activeTab === 'artifacts' && <ArtifactHub apiBaseUrl={API_BASE_URL} activeSystemId={activeSystemId} />}
          {activeTab === 'weekly-reports' && <WeeklyReportView apiBaseUrl={API_BASE_URL} activeSystemId={activeSystemId} />}
          {activeTab === 'reviews' && <ReviewManager apiBaseUrl={API_BASE_URL} />}
          {activeTab === 'reports' && <QualityReport apiBaseUrl={API_BASE_URL} />}
          {activeTab === 'timeline' && <TimelineView currentSystemMilestones={milestones} apiBaseUrl={API_BASE_URL} />}
        </main>
      </div>
    </div>
  );
}

export default App;
