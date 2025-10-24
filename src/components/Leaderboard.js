import React from 'react';

const Leaderboard = () => {
  return (
    <div style={{padding: '0.5rem'}}>
      <div style={{fontWeight: 700}}>Top Volunteers</div>
      <ol style={{marginTop: '0.5rem'}}>
        <li>Alex — 320 pts</li>
        <li>Maria — 280 pts</li>
        <li>Sam — 240 pts</li>
      </ol>
    </div>
  );
};

export default Leaderboard;
