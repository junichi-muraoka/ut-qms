import React from 'react';
import type { Priority, TestItem } from '../../types';

interface IssueInput {
  title: string;
  description: string;
  priority: Priority;
}

interface AddIssueModalProps {
  newIssue: IssueInput;
  setNewIssue: (issue: IssueInput) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const AddIssueModal: React.FC<AddIssueModalProps> = ({ newIssue, setNewIssue, onSave, onClose }) => (
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
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>キャンセル</button>
          <button type="submit" className="btn-primary" style={{ marginLeft: '1rem' }}>保存</button>
        </div>
      </form>
    </div>
  </div>
);

interface DefectInput {
  title: string;
  description: string;
  priority: Priority;
  testItemId: string;
}

interface AddDefectModalProps {
  newDefect: DefectInput;
  setNewDefect: (defect: DefectInput) => void;
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

interface TestItemInput {
  title: string;
  expectedResult: string;
  precondition: string;
}

interface AddTestItemModalProps {
  newItem: TestItemInput;
  setNewItem: (item: TestItemInput) => void;
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
