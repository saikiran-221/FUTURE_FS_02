import React, { useState } from 'react';
import { Filter, User, Mail, MessageSquare, Phone, Plus, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';

function LeadCard({ lead, isTrackedView, onUntrack, onAddNote, onMarkContacted }) {
  const [noteText, setNoteText] = useState('');

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(lead.id, noteText);
    setNoteText('');
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === 'Enter') handleAddNote();
  };

  return (
    <div className="lead-card">
      <div className="lead-card-header">
        <div className="lead-info">
          <div className="lead-name">
            <User size={20} />
            <h3>{lead.name}</h3>
          </div>
          <div className="lead-meta">
            <span><Mail size={14} /> {lead.email}</span>
            {lead.phone && <span><Phone size={14} /> {lead.phone}</span>}
            {lead.source && <span className="source-tag"><Filter size={14} /> {lead.source}</span>}
          </div>
        </div>
        <div className="lead-card-badges">
          <div className={`status-badge status-${lead.status}`}>{lead.status}</div>
          {isTrackedView && (
            <span className="track-btn tracked">
              <CheckCircle size={14} /> Tracked
            </span>
          )}
        </div>
      </div>

      {lead.message && (
        <div className="lead-message">
          <strong><MessageSquare size={14} /> Message:</strong>
          <p>{lead.message}</p>
        </div>
      )}

      <div className="notes-section">
        <h4>Notes & Timeline</h4>
        <div className="notes-list">
          {lead.notes && lead.notes.map(note => (
            <div key={note.id} className="note-item">
              <p>{note.note}</p>
              <small>{new Date(note.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
        <div className="add-note-box">
          <input
            type="text"
            placeholder="Add a follow-up note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleNoteKeyDown}
          />
          <button onClick={handleAddNote} disabled={!noteText.trim()}><Plus size={18} /></button>
        </div>
      </div>

      {isTrackedView && onUntrack && (
        <div className="lead-actions">
          <button 
            onClick={() => onUntrack(lead.id)} 
            className="btn-action untrack"
          >
            <RotateCcw size={16} style={{marginRight: '6px', verticalAlign: 'middle'}}/> Move Back to New Leads
          </button>
        </div>
      )}

      {!isTrackedView && onMarkContacted && (
        <div className="lead-actions">
          <button 
            onClick={() => onMarkContacted(lead.id)} 
            className="btn-action contacted"
          >
            Mark as Contacted &amp; Move to Tracked <ArrowRight size={16} style={{marginLeft: '4px', verticalAlign: 'middle'}}/>
          </button>
        </div>
      )}
    </div>
  );
}

export default LeadCard;
