import React from 'react';

const EmptyState = ({ title = 'Nothing here', message = '' }) => {
  return (
    <div style={{padding: '1rem', textAlign: 'center'}}>
      <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📝</div>
      <h4>{title}</h4>
      <p style={{color: '#666'}}>{message}</p>
    </div>
  );
};

export default EmptyState;
