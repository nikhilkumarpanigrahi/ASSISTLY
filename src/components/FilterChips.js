import React from 'react';

const FilterChips = ({ chips = [] }) => {
  return (
    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
      {chips.map((c, i) => (
        <div key={i} style={{background: '#f1f1f1', padding: '0.25rem 0.6rem', borderRadius: 20, fontSize: '0.85rem'}}>{c} ✕</div>
      ))}
    </div>
  );
};

export default FilterChips;
