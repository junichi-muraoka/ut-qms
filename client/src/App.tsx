import React, { useState, useEffect } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : 'https://ut-qms.j-muraoka-secure.workers.dev'

function App() {
  const [activeTab, setActiveTab] = useState('test-items')
  const [testItems, setTestItems] = useState([])
  const [defects, setDefects] = useState([])
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [showAddDefectForm, setShowAddDefectForm] = useState(false)
  const [showAddIssueForm, setShowAddIssueForm] = useState(false)
  
  const [newItem, setNewItem] = useState({ title: '', expectedResult: '', precondition: '' })
  const [newDefect, setNewDefect] = useState({ title: '', description: '', priority: 'Medium' as any, testItemId: '' })
  const [newIssue, setNewIssue] = useState({ title: '', description: '', priority: 'Medium' as any })

  const [stats, setStats] = useState({
    totalTests: 0,
    testPassRate: 0,
    openDefects: 0,
    progress: 0
  })

  const [trendData, setTrendData] = useState({
    progressTrend: [],
    qualityTrend: []
  })

  const fetchTestItems = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items`)
      const data = await res.json()
      setTestItems(data.items || [])
    } catch (err) {
      console.error('Failed to fetch test items', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDefects = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects`)
      const data = await res.json()
      setDefects(data.items || [])
    } catch (err) {
      console.error('Failed to fetch defects', err)
    } finally {
      setLoading(false)
    }
  }
  const fetchIssues = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`)
      const data = await res.json()
      setIssues(data.items || [])
    } catch (err) {
      console.error('Failed to fetch issues', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIssue, status: 'Todo' })
      })
      if (res.ok) {
        setShowAddIssueForm(false)
        setNewIssue({ title: '', description: '', priority: 'Medium' })
        fetchIssues()
      }
    } catch (err) {
      console.error('Failed to create issue', err)
    }
  }

  const handleIssueStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchIssues()
      }
    } catch (err) {
      console.error('Failed to update issue status', err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trends`)
      const data = await res.json()
      setTrendData(data)
    } catch (err) {
      console.error('Failed to fetch trends', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats()
      fetchTrends()
    }
    if (activeTab === 'test-items') fetchTestItems()
    if (activeTab === 'defects') fetchDefects()
    if (activeTab === 'issues') fetchIssues()
  }, [activeTab])

  const handleCreateDefect = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDefect, status: 'Open' })
      })
      if (res.ok) {
        setShowAddDefectForm(false)
        setNewDefect({ title: '', description: '', priority: 'Medium' as any, testItemId: '' })
        fetchDefects()
      }
    } catch (err) {
      console.error('Failed to create defect', err)
    }
  }

  const handleDefectStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/defects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchDefects()
      }
    } catch (err) {
      console.error('Failed to update defect status', err)
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          status: 'NoRun'
        })
      })
      if (res.ok) {
        setShowAddForm(false)
        setNewItem({ title: '', expectedResult: '', precondition: '' })
        fetchTestItems()
      }
    } catch (err) {
      console.error('Failed to create test item', err)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/test-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchTestItems()
      }
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">UT-QMS</div>
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

      <main className="main-content">
        <header className="header">
          <h1>{
            activeTab === 'test-items' ? 'テスト項目管理' : 
            activeTab === 'dashboard' ? '総合ダッシュボード' :
            activeTab === 'defects' ? '不具合一覧' : '課題一覧'
          }</h1>
          <div className="header-actions">
            <button className="btn-primary" onClick={
              activeTab === 'test-items' ? fetchTestItems : 
              activeTab === 'defects' ? fetchDefects : fetchIssues
            }>更新</button>
            <button 
              className="btn-primary" 
              style={{marginLeft: '10px'}} 
              onClick={() => {
                if (activeTab === 'test-items') setShowAddForm(true)
                else if (activeTab === 'defects') setShowAddDefectForm(true)
                else setShowAddIssueForm(true)
              }}
            >
              + 新規作成
            </button>
          </div>
        </header>

        {showAddIssueForm && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
              <h2>課題の新規作成</h2>
              <form onSubmit={handleCreateIssue}>
                <div style={{margin: '1rem 0'}}>
                  <label>課題名</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newIssue.title} 
                    onChange={e => setNewIssue({...newIssue, title: e.target.value})}
                    required
                  />
                </div>
                <div style={{margin: '1rem 0'}}>
                  <label>詳細内容</label>
                  <textarea 
                    className="form-input" 
                    value={newIssue.description}
                    onChange={e => setNewIssue({...newIssue, description: e.target.value})}
                    required
                  />
                </div>
                <div style={{margin: '1rem 0'}}>
                  <label>優先度</label>
                  <select 
                    className="form-input"
                    value={newIssue.priority}
                    onChange={e => setNewIssue({...newIssue, priority: e.target.value as any})}
                  >
                    <option value="Critical">最優先</option>
                    <option value="High">高</option>
                    <option value="Medium">中</option>
                    <option value="Low">低</option>
                  </select>
                </div>
                <div className="header-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddIssueForm(false)}>キャンセル</button>
                  <button type="submit" className="btn-primary" style={{marginLeft: '1rem'}}>保存</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddDefectForm && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
              <h2>不具合の新規登録</h2>
              <form onSubmit={handleCreateDefect}>
                <div style={{margin: '1rem 0'}}>
                  <label>不具合の概要</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newDefect.title} 
                    onChange={e => setNewDefect({...newDefect, title: e.target.value})}
                    required
                  />
                </div>
                <div style={{margin: '1rem 0'}}>
                  <label>詳細内容</label>
                  <textarea 
                    className="form-input" 
                    value={newDefect.description}
                    onChange={e => setNewDefect({...newDefect, description: e.target.value})}
                    required
                  />
                </div>
                <div style={{margin: '1rem 0'}}>
                  <label>優先度</label>
                  <select 
                    className="form-input"
                    value={newDefect.priority}
                    onChange={e => setNewDefect({...newDefect, priority: e.target.value as any})}
                  >
                    <option value="Critical">最優先</option>
                    <option value="High">高</option>
                    <option value="Medium">中</option>
                    <option value="Low">低</option>
                  </select>
                </div>
                <div style={{margin: '1rem 0'}}>
                  <label>関連テスト項目</label>
                  <select 
                    className="form-input"
                    value={newDefect.testItemId}
                    onChange={e => setNewDefect({...newDefect, testItemId: e.target.value})}
                  >
                    <option value="">なし</option>
                    {testItems.map((item: any) => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                  </select>
                </div>
                <div className="header-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddDefectForm(false)}>キャンセル</button>
                  <button type="submit" className="btn-primary" style={{marginLeft: '1rem'}}>登録</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{maxWidth: '500px', margin: 'auto'}}>
              <h2>テスト項目の新規作成</h2>
              <form onSubmit={handleCreateItem}>
                <div style={{margin: '1rem 0'}}>
                  <label>テスト項目名</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newItem.title} 
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                    required
                  />
                </div>
                <div style={{margin: '1rem 0'}}>
                  <label>前提条件</label>
                  <textarea 
                    className="form-input" 
                    value={newItem.precondition}
                    onChange={e => setNewItem({...newItem, precondition: e.target.value})}
                  />
                </div>
                <div style={{margin: '1rem 0'}}>
                  <label>期待される結果</label>
                  <textarea 
                    className="form-input" 
                    value={newItem.expectedResult}
                    onChange={e => setNewItem({...newItem, expectedResult: e.target.value})}
                    required
                  />
                </div>
                <div className="header-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>キャンセル</button>
                  <button type="submit" className="btn-primary" style={{marginLeft: '1rem'}}>保存</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'test-items' && (
          <section className="card">
            {loading ? (
              <p>読み込み中...</p>
            ) : testItems.length === 0 ? (
              <p>データがありません。「新規作成」から追加してください。</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>項目名</th>
                    <th>前提条件</th>
                    <th>期待される結果</th>
                    <th>ステータス</th>
                    <th>最終更新</th>
                  </tr>
                </thead>
                <tbody>
                  {testItems.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.precondition}</td>
                      <td>{item.expectedResult}</td>
                      <td>
                        <select 
                          className={`badge badge-${item.status.toLowerCase()}`}
                          style={{border: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center'}}
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        >
                          <option value="NoRun">未実施</option>
                          <option value="Pass">合格</option>
                          <option value="Fail">不合格</option>
                          <option value="Blocked">保留</option>
                        </select>
                      </td>
                      <td>{new Date(item.updatedAt).toLocaleString('ja-JP')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'defects' && (
          <section className="card">
            {loading ? (
              <p>読み込み中...</p>
            ) : defects.length === 0 ? (
              <p>不具合データがありません。「新規作成」から登録してください。</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>概要</th>
                    <th>優先度</th>
                    <th>ステータス</th>
                    <th>最終更新</th>
                  </tr>
                </thead>
                <tbody>
                  {defects.map((defect: any) => (
                    <tr key={defect.id}>
                      <td>{defect.title}</td>
                      <td>
                        <span className={`priority priority-${defect.priority.toLowerCase()}`}>
                          {defect.priority === 'Critical' ? '最優先' : 
                           defect.priority === 'High' ? '高' : 
                           defect.priority === 'Medium' ? '中' : '低'}
                        </span>
                      </td>
                      <td>
                        <select 
                          className={`badge badge-${defect.status.toLowerCase()}`}
                          style={{border: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center'}}
                          value={defect.status}
                          onChange={(e) => handleDefectStatusChange(defect.id, e.target.value)}
                        >
                          <option value="Open">オープン</option>
                          <option value="Investigating">調査中</option>
                          <option value="Fixed">修正済</option>
                          <option value="Verified">確認済</option>
                          <option value="Closed">クローズ済</option>
                        </select>
                      </td>
                      <td>{new Date(defect.updatedAt).toLocaleString('ja-JP')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'issues' && (
          <section className="card">
            {loading ? (
              <p>読み込み中...</p>
            ) : issues.length === 0 ? (
              <p>課題データがありません。「新規作成」から登録してください。</p>
            ) : (
              <div className="kanban-board" style={{display: 'flex', gap: '1rem', overflowX: 'auto'}}>
                {['Todo', 'InProgress', 'Done'].map(status => (
                  <div key={status} className="kanban-column" style={{flex: 1, minWidth: '250px', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px'}}>
                    <h3 style={{marginBottom: '1rem'}}>{
                      status === 'Todo' ? '未着手' : 
                      status === 'InProgress' ? '進行中' : '完了'
                    }</h3>
                    {issues.filter((i: any) => i.status === status).map((issue: any) => (
                      <div key={issue.id} className="card" style={{marginBottom: '0.5rem', padding: '1rem', cursor: 'pointer'}}>
                        <div style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>{issue.title}</div>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{issue.description}</div>
                        <div style={{marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between'}}>
                          <span className={`priority priority-${issue.priority.toLowerCase()}`} style={{fontSize: '0.75rem'}}>
                            {issue.priority === 'Critical' ? '最優先' : 
                             issue.priority === 'High' ? '高' : 
                             issue.priority === 'Medium' ? '中' : '低'}
                          </span>
                        </div>
                        <select 
                          style={{width: '100%', marginTop: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px'}}
                          value={issue.status}
                          onChange={(e) => handleIssueStatusChange(issue.id, e.target.value)}
                        >
                          <option value="Todo">未着手</option>
                          <option value="InProgress">進行中</option>
                          <option value="Done">完了</option>
                        </select>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-content" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div className="dashboard-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
              <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
                <h3 style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>テスト総数</h3>
                <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0'}}>{stats.totalTests}</div>
                <div style={{fontSize: '0.8rem', color: 'var(--success-color)'}}>実施済み</div>
              </div>
              <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
                <h3 style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>テスト合格率</h3>
                <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--primary-color)'}}>
                  {stats.testPassRate.toFixed(1)}%
                </div>
                <div className="progress-bar" style={{height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden'}}>
                  <div style={{width: `${stats.testPassRate}%`, height: '100%', background: 'var(--primary-color)'}} />
                </div>
              </div>
              <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
                <h3 style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>未解決不具合</h3>
                <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: stats.openDefects > 0 ? 'var(--error-color)' : 'var(--success-color)'}}>
                  {stats.openDefects}
                </div>
                <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>件</div>
              </div>
              <div className="card" style={{textAlign: 'center', padding: '1.5rem'}}>
                <h3 style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>プロジェクト進捗</h3>
                <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0'}}>
                  {stats.progress.toFixed(1)}%
                </div>
                <div className="progress-bar" style={{height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden'}}>
                  <div style={{width: `${stats.progress}%`, height: '100%', background: '#10b981'}} />
                </div>
              </div>
            </div>

            <div className="charts-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem'}}>
              <div className="card ChartContainer">
                <h3 style={{marginBottom: '1rem'}}>進捗管理 (バーンダウン)</h3>
                <div style={{height: '300px', width: '100%'}}>
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
                <h3 style={{marginBottom: '1rem'}}>品質分析 (不具合推移)</h3>
                <div style={{height: '300px', width: '100%'}}>
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
        )}
      </main>
    </div>
  )
}

export default App
