import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { 
  Priority, TestItem, Milestone, 
  MilestoneInput, IssueInput, DefectInput, TestItemInput 
} from '../../types/index';

interface AddIssueModalProps {
  newIssue: IssueInput;
  setNewIssue: Dispatch<SetStateAction<IssueInput>>;
  milestones: Milestone[];
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AddIssueModal: React.FC<AddIssueModalProps> = ({ newIssue, setNewIssue, milestones, onSave, onClose }) => (
  <div className="modal-overlay">
    <div className="card modal-content" style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>課題の新規作成</h2>
      <form onSubmit={onSave}>
        <div style={{ margin: '1rem 0' }}>
          <label>課題名</label>
          <input 
            type="text" 
            className="form-input" 
            value={newIssue.title} 
            onChange={e => setNewIssue({ ...newIssue, title: e.target.value })}
            required
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>詳細内容</label>
          <textarea 
            className="form-input" 
            value={newIssue.description}
            onChange={e => setNewIssue({ ...newIssue, description: e.target.value })}
            required
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>優先度</label>
          <select 
            className="form-input"
            value={newIssue.priority}
            onChange={e => setNewIssue({ ...newIssue, priority: e.target.value as Priority })}
          >
            <option value="Critical">最優先</option>
            <option value="High">高</option>
            <option value="Medium">中</option>
            <option value="Low">低</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ flex: 1 }}>
            <label>開始日</label>
            <input 
              type="date" 
              className="form-input" 
              value={newIssue.startDate || ''} 
              onChange={e => setNewIssue({ ...newIssue, startDate: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>完了期限</label>
            <input 
              type="date" 
              className="form-input" 
              value={newIssue.dueDate || ''} 
              onChange={e => setNewIssue({ ...newIssue, dueDate: e.target.value })}
            />
          </div>
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>マイルストーン (WBS連携)</label>
          <select 
            className="form-input"
            value={newIssue.milestoneId || ''}
            onChange={e => setNewIssue({ ...newIssue, milestoneId: e.target.value })}
          >
            <option value="">なし</option>
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button type="submit" className="btn-primary" style={{ marginLeft: '1rem' }}>保存</button>
        </div>
      </form>
    </div>
  </div>
);



interface AddDefectModalProps {
  newDefect: DefectInput;
  setNewDefect: Dispatch<SetStateAction<DefectInput>>;
  testItems: TestItem[];
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AddDefectModal: React.FC<AddDefectModalProps> = ({ newDefect, setNewDefect, testItems, onSave, onClose }) => (
  <div className="modal-overlay">
    <div className="card modal-content" style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>不具合の新規登録</h2>
      <form onSubmit={onSave}>
        <div style={{ margin: '1rem 0' }}>
          <label>不具合の概要</label>
          <input 
            type="text" 
            className="form-input" 
            value={newDefect.title} 
            onChange={e => setNewDefect({ ...newDefect, title: e.target.value })}
            required
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>詳細内容</label>
          <textarea 
            className="form-input" 
            value={newDefect.description}
            onChange={e => setNewDefect({ ...newDefect, description: e.target.value })}
            required
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>優先度</label>
          <select 
            className="form-input"
            value={newDefect.priority}
            onChange={e => setNewDefect({ ...newDefect, priority: e.target.value as Priority })}
          >
            <option value="Critical">最優先</option>
            <option value="High">高</option>
            <option value="Medium">中</option>
            <option value="Low">低</option>
          </select>
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>関連テスト項目</label>
          <select 
            className="form-input"
            value={newDefect.testItemId}
            onChange={e => setNewDefect({ ...newDefect, testItemId: e.target.value })}
          >
            <option value="">なし</option>
            {testItems.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button type="submit" className="btn-primary" style={{ marginLeft: '1rem' }}>登録</button>
        </div>
      </form>
    </div>
  </div>
);



interface AddTestItemModalProps {
  newItem: TestItemInput;
  setNewItem: Dispatch<SetStateAction<TestItemInput>>;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AddTestItemModal: React.FC<AddTestItemModalProps> = ({ newItem, setNewItem, onSave, onClose }) => (
  <div className="modal-overlay">
    <div className="card modal-content" style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>テスト項目の新規作成</h2>
      <form onSubmit={onSave}>
        <div style={{ margin: '1rem 0' }}>
          <label>テスト項目名</label>
          <input 
            type="text" 
            className="form-input" 
            value={newItem.title} 
            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
            required
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>前提条件</label>
          <textarea 
            className="form-input" 
            value={newItem.precondition}
            onChange={e => setNewItem({ ...newItem, precondition: e.target.value })}
          />
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>期待される結果</label>
          <textarea 
            className="form-input" 
            value={newItem.expectedResult}
            onChange={e => setNewItem({ ...newItem, expectedResult: e.target.value })}
            required
          />
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button type="submit" className="btn-primary" style={{ marginLeft: '1rem' }}>保存</button>
        </div>
      </form>
    </div>
  </div>
);

interface AddMilestoneModalProps {
  newMilestone: MilestoneInput;
  setNewMilestone: Dispatch<SetStateAction<MilestoneInput>>;
  allMilestones: Milestone[]; // To select dependency from other systems
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({ newMilestone, setNewMilestone, allMilestones, onSave, onClose }) => (
  <div className="modal-overlay">
    <div className="card modal-content" style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>工程（マイルストーン）の新規作成</h2>
      <form onSubmit={onSave}>
        <div style={{ margin: '1rem 0' }}>
          <label>工程名</label>
          <input 
            type="text" 
            className="form-input" 
            value={newMilestone.name} 
            onChange={e => setNewMilestone({ ...newMilestone, name: e.target.value })}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ flex: 1 }}>
            <label>開始日</label>
            <input 
              type="date" 
              className="form-input" 
              value={newMilestone.startDate} 
              onChange={e => setNewMilestone({ ...newMilestone, startDate: e.target.value })}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>完了日</label>
            <input 
              type="date" 
              className="form-input" 
              value={newMilestone.dueDate} 
              onChange={e => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
              required
            />
          </div>
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>工程カテゴリ</label>
          <select 
            className="form-input"
            value={newMilestone.category || ''}
            onChange={e => setNewMilestone({ ...newMilestone, category: e.target.value })}
            required
          >
            <option value="">選択してください...</option>
            <optgroup label="1. 設計・製造">
              <option value="Requirements">要件定義</option>
              <option value="BasicDesign">基本設計</option>
              <option value="DetailDesign">詳細設計</option>
              <option value="Build">製造</option>
            </optgroup>
            <optgroup label="2. 機能テスト">
              <option value="UT">単体テスト (UT)</option>
              <option value="IT-A">内部結合 (IT-A)</option>
              <option value="IT-B">外部結合 (IT-B)</option>
              <option value="ST-F">システム機能 (ST-F)</option>
            </optgroup>
            <optgroup label="3. 非機能・特殊">
              <option value="PerfLoad">性能・負荷テスト</option>
              <option value="SecRecov">セキュリティ・リカバリ</option>
              <option value="OperMig">移行・運用テスト</option>
            </optgroup>
            <optgroup label="4. 最終・切替">
              <option value="UAT">ユーザ受入 (UAT)</option>
              <option value="Cutover">本番切替</option>
            </optgroup>
          </select>
        </div>
        <div style={{ margin: '1rem 0' }}>
          <label>依存する他工程（オプション）</label>
          <select 
            className="form-input"
            value={newMilestone.dependsOnMilestoneId || ''}
            onChange={e => setNewMilestone({ ...newMilestone, dependsOnMilestoneId: e.target.value })}
          >
            <option value="">なし</option>
            {allMilestones.map(m => (
              <option key={m.id} value={m.id}>
                [{m.systemId?.substring(0,4)}] {m.name}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            ※ 本工程の開始前に完了している必要がある工程を選択します。
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button type="submit" className="btn-primary" style={{ marginLeft: '1rem' }}>作成</button>
        </div>
      </form>
    </div>
  </div>
);
