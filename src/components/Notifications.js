import React from 'react';

const Notifications = () => {
  return (
    <div style={{padding: '0.5rem'}}>
      <div style={{fontWeight: 700}}>Notifications</div>
      <ul style={{marginTop: '0.5rem'}}>
        <li>🔔 John claimed your request</li>
        <li>🔔 New message from Sarah</li>
        <li>🔔 You earned 10 points</li>
      </ul>
    </div>
  );
};

export default Notifications;
