import React from 'react';

const ProfileCard = ({ user = {} }) => {
  return (
    <div style={{padding: '1rem'}}>
      <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <div style={{width: 64, height: 64, borderRadius: '50%', background: '#eee'}} />
        <div>
          <div style={{fontWeight: 700}}>{user.displayName || 'Anonymous'}</div>
          <div style={{fontSize: '0.85rem', color: '#666'}}>Points: {user.points ?? 0}</div>
        </div>
      </div>
      <p style={{marginTop: '0.5rem', color: '#666'}}>Short bio or location goes here.</p>
    </div>
  );
};

export default ProfileCard;
