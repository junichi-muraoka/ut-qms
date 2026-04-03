import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);

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

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/me`);
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const fetchTestItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items`);
      const data = await res.json();
      setTestItems(data.items || []);
    } catch (err) {
      console.error('Failed to fetch test items', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects`);
      const data = await res.json();
      setDefects(data.items || []);
    } catch (err) {
      console.error('Failed to fetch defects', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`);
      const data = await res.json();
      setIssues(data.items || []);
    } catch (err) {
      console.error('Failed to fetch issues', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trends`);
      const data = await res.json();
      setTrendData(data);
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchTestItems();
    fetchDefects();
    fetchIssues();
    fetchStats();
    fetchTrends();
  }, []);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIssue, status: 'Todo' })
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
        body: JSON.stringify({ status: newStatus })
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
        body: JSON.stringify({ ...newDefect, status: 'Open' })
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
        body: JSON.stringify({ status: newStatus })
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
        body: JSON.stringify({ ...newItem, status: 'NoRun' })
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
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchTestItems();
      }
    } catch (err) {
      console.error('Failed to update test status', err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        <Header 
          activeTab={activeTab} 
          user={user}
          onRefresh={() => {
            if (activeTab === 'dashboard') { fetchStats(); fetchTrends(); }
            else if (activeTab === 'test-items') fetchTestItems();
            else if (activeTab === 'defects') fetchDefects();
            else fetchIssues();
          }}
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

        {activeTab === 'dashboard' && <Dashboard stats={stats} trendData={trendData} />}
        {activeTab === 'test-items' && <TestManager testItems={testItems} loading={loading} onStatusChange={handleTestStatusChange} />}
        {activeTab === 'defects' && <DefectManager defects={defects} loading={loading} onStatusChange={handleDefectStatusChange} />}
        {activeTab === 'issues' && <IssueBoard issues={issues} loading={loading} onStatusChange={handleIssueStatusChange} />}
      </main>
    </div>
  );
}

export default App;
