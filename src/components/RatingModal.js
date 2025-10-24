import React, { useState } from 'react';

const RatingModal = ({ requestId, open = true, onClose, onSubmit }) => {
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit?.({ requestId, value, comment });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Rate the volunteer</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div style={{padding: '1rem'}}>
          <div>
            <label>Stars: </label>
            <select value={value} onChange={(e) => setValue(Number(e.target.value))}>
              {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} stars</option>)}
            </select>
          </div>

          <div style={{marginTop: '1rem'}}>
            <label>Comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} style={{width: '100%', minHeight: 80}} />
          </div>

          <div style={{marginTop: '1rem', display:'flex', justifyContent: 'flex-end', gap: '0.5rem'}}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit Rating</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
