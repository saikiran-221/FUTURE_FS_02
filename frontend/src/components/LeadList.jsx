import React from 'react';
import LeadCard from './LeadCard';

function LeadList({ leads, loading, emptyMessage, isTrackedView, onUntrack, onAddNote, onMarkContacted }) {
  if (loading) {
    return <div className="loading-state">Loading leads...</div>;
  }

  if (leads.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="leads-single-column">
      {leads.map(lead => (
        <LeadCard 
          key={lead.id} 
          lead={lead} 
          isTrackedView={isTrackedView}
          onUntrack={onUntrack}
          onAddNote={onAddNote}
          onMarkContacted={onMarkContacted}
        />
      ))}
    </div>
  );
}

export default LeadList;
