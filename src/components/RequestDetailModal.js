import React from 'react';

const RequestDetailModal = ({ request, onClose, onOpenRating }) => {
  if (!request) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{request.title}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div style={{padding: '1rem'}}>
          <p>{request.description}</p>
          <div style={{marginTop: '1rem'}}>
            <strong>Location:</strong> {typeof request.location === 'string' ? request.location : request.location?.address || 'Location set'}
          </div>
          <div style={{marginTop: '0.5rem'}}>
            <strong>Urgency:</strong> <span className={`urgency-badge ${request.urgency}`}>{request.urgency}</span>
          </div>

          <div style={{marginTop: '1rem'}}>
            <strong>Timeline:</strong>
            <ul>
              {(request.history || []).map((h, i) => (
                <li key={i}>{h.type} — {h.by} — {h.at?.toDate ? h.at.toDate().toLocaleString() : ''}</li>
              ))}
            </ul>
          </div>

          {request.status === 'completed' && (
            <div style={{marginTop: '1rem'}}>
              <button className="btn btn-primary" onClick={() => onOpenRating?.(request.id)}>Leave a Rating</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
