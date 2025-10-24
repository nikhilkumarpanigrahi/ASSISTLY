import React from 'react';
import RequestDetailModal from './RequestDetailModal';
import ProfileCard from './ProfileCard';
import RatingModal from './RatingModal';
import Notifications from './Notifications';
import ChatPreview from './ChatPreview';
import MapView from './MapView';
import FilterChips from './FilterChips';
import SavedFilters from './SavedFilters';
import EmptyState from './EmptyState';
import Leaderboard from './Leaderboard';
import OnboardingTour from './OnboardingTour';
import RequestMedia from './RequestMedia';
import AdminPanel from './AdminPanel';

const FeatureShowcase = () => {
  return (
    <section className="feature-showcase" style={{marginTop: '2rem'}}>
      <h3 style={{marginBottom: '1rem'}}>Prototype: UI / UX Feature Showcase</h3>
      <div className="features-grid">
        <div className="feature-card">
          <h4>Request Detail</h4>
          <RequestDetailModal open={false} />
        </div>

        <div className="feature-card">
          <h4>Profile Card</h4>
          <ProfileCard user={{displayName: 'Demo User', points: 42}} />
        </div>

        <div className="feature-card">
          <h4>Rating Modal</h4>
          <RatingModal open={false} />
        </div>

        <div className="feature-card">
          <h4>Notifications</h4>
          <Notifications />
        </div>

        <div className="feature-card">
          <h4>Chat Preview</h4>
          <ChatPreview />
        </div>

        <div className="feature-card">
          <h4>Map View</h4>
          <MapView />
        </div>

        <div className="feature-card">
          <h4>Filter Chips</h4>
          <FilterChips chips={["High", "Shopping", "Nearby"]} />
        </div>

        <div className="feature-card">
          <h4>Saved Filters</h4>
          <SavedFilters />
        </div>

        <div className="feature-card">
          <h4>Empty State</h4>
          <EmptyState title="No matching requests" message="Try changing filters or post a request." />
        </div>

        <div className="feature-card">
          <h4>Leaderboard</h4>
          <Leaderboard />
        </div>

        <div className="feature-card">
          <h4>Onboarding Tour</h4>
          <OnboardingTour />
        </div>

        <div className="feature-card">
          <h4>Request Media</h4>
          <RequestMedia />
        </div>

        <div className="feature-card">
          <h4>Admin Panel (preview)</h4>
          <AdminPanel />
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
