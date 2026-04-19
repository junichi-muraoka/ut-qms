import React, { useState, useEffect } from 'react';
import type { Review, ReviewItem, ReviewItemStatus, ReviewStatus } from '../../types/index';

interface ReviewManagerProps {
  apiBaseUrl: string;
}

const ReviewManager: React.FC<ReviewManagerProps> = ({ apiBaseUrl }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newReviewItem, setNewReviewItem] = useState({ content: '', severity: 'Medium' as 'Low'|'Medium'|'High' });

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/reviews`, { credentials: 'include' });
      const data = await res.json();
      setReviews(data.items || []);
      if (data.items?.length > 0 && !selectedReview) {
        setSelectedReview(data.items[0]);
        fetchReviewItems(data.items[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviewItems = async (reviewId: string) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/review-items/review/${reviewId}`, { credentials: 'include' });
      const data = await res.json();
      setReviewItems(data.items || []);
    } catch (err) {
      console.error('Failed to fetch review items', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewStatusChange = async (id: string, newStatus: ReviewStatus) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(reviews.map(r => r.id === updated.id ? updated : r));
        setSelectedReview(updated);
      }
    } catch (err) {
      console.error('Failed to update review status', err);
    }
  };

  const handleItemStatusChange = async (id: string, newStatus: ReviewItemStatus) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/review-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        setReviewItems(reviewItems.map(item => item.id === updated.id ? updated : item));
      }
    } catch (err) {
      console.error('Failed to update item status', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/review-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          ...newReviewItem,
          status: 'Open'
        }),
        credentials: 'include',
      });
      if (res.ok) {
        const created = await res.json();
        setReviewItems([...reviewItems, created]);
        setNewReviewItem({ content: '', severity: 'Medium' });
        setShowAddItem(false);
      }
    } catch (err) {
      console.error('Failed to add review item', err);
    }
  };

  const severityColors = {
    High: '#ff4d4f',
    Medium: '#faad14',
    Low: '#52c41a'
  };

  if (isLoading) return <div className="p-8">読み込み中...</div>;

  return (
    <div className="review-manager-container" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '24px' }}>
      {/* Sidebar List */}
      <div className="review-list-sidebar" style={{ width: '300px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '20px', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '20px' }}>レビュー一覧</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map(review => (
            <div
              key={review.id}
              onClick={() => {
                setSelectedReview(review);
                fetchReviewItems(review.id);
              }}
              style={{
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedReview?.id === review.id ? '#0066ff' : '#eee',
                backgroundColor: selectedReview?.id === review.id ? '#f0f7ff' : '#fff',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{new Date(review.targetDate).toLocaleDateString()}</div>
              <div style={{ fontWeight: '600', color: selectedReview?.id === review.id ? '#0066ff' : '#333' }}>{review.title}</div>
              <div style={{ marginTop: '8px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  backgroundColor: review.status === 'Closed' ? '#e6fffa' : '#fff7e6',
                  color: review.status === 'Closed' ? '#389e0d' : '#d46b08',
                  border: '1px solid',
                  borderColor: review.status === 'Closed' ? '#b7eb8f' : '#ffd591'
                }}>
                  {review.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Area */}
      <div className="review-detail-area" style={{ flex: 1, backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px', overflowY: 'auto' }}>
        {selectedReview ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ marginBottom: '8px' }}>{selectedReview.title}</h2>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  実施日: {new Date(selectedReview.targetDate).toLocaleDateString()} | 査読者: {selectedReview.reviewers || '未指定'}
                </div>
              </div>
              <select
                value={selectedReview.status}
                onChange={(e) => handleReviewStatusChange(selectedReview.id, e.target.value as ReviewStatus)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontWeight: '600'
                }}
              >
                <option value="Todo">準備中 (Todo)</option>
                <option value="InReview">レビュー中 (InReview)</option>
                <option value="Fixed">修正完了 (Fixed)</option>
                <option value="Closed">クローズ (Closed)</option>
              </select>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>指摘事項 ({reviewItems.length})</h3>
                <button 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setShowAddItem(true)}
                >
                  <span>+</span> 指摘を追加
                </button>
              </div>

              {showAddItem && (
                <form onSubmit={handleAddItem} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>指摘内容</label>
                    <textarea 
                      required
                      value={newReviewItem.content}
                      onChange={e => setNewReviewItem({...newReviewItem, content: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                      placeholder="指摘内容を入力してください"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>重要度</label>
                      <select 
                        value={newReviewItem.severity}
                        onChange={e => setNewReviewItem({...newReviewItem, severity: e.target.value as any})}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                      >
                        <option value="High">高 (High)</option>
                        <option value="Medium">中 (Medium)</option>
                        <option value="Low">低 (Low)</option>
                      </select>
                    </div>
                    <div>
                      <button type="button" className="btn-secondary" onClick={() => setShowAddItem(false)} style={{ marginRight: '10px' }}>キャンセル</button>
                      <button type="submit" className="btn-primary">登録</button>
                    </div>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviewItems.length > 0 ? reviewItems.map(item => (
                  <div key={item.id} style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ 
                      width: '4px', 
                      height: '40px', 
                      backgroundColor: severityColors[item.severity],
                      borderRadius: '2px'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>{item.content}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>重要度: {item.severity}</div>
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) => handleItemStatusChange(item.id, e.target.value as ReviewItemStatus)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '13px',
                        backgroundColor: item.status === 'Closed' ? '#f6faff' : '#fff'
                      }}
                    >
                      <option value="Open">未対応 (Open)</option>
                      <option value="Fixed">修正済 (Fixed)</option>
                      <option value="Closed">確認済 (Closed)</option>
                    </select>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999', backgroundColor: '#fdfdfd', borderRadius: '12px', border: '1px dashed #eee' }}>
                    指摘事項はまだありません。
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>総評 / サマリー</h3>
              <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '12px', color: '#444', lineHeight: '1.6' }}>
                {selectedReview.summary || 'サマリーが登録されていません。'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999', flexDirection: 'column', gap: '16px' }}>
             <span style={{ fontSize: '48px' }}>📝</span>
             <p>レビューを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManager;
