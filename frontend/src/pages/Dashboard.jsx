import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Clock, ShieldPlus, BookOpen, CheckCircle, Mail } from 'lucide-react';
import LeadList from '../components/LeadList';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';


function Dashboard({ token }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'tracked', 'admins'
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin creation form state
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admin/leads`, { headers });
      setLeads(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLeads();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/api/admin/leads/${id}`, { status }, { headers });
      fetchLeads();
      Swal.fire('Updated', `Status changed to "${status}"`, 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const markAsContactedAndTrack = async (leadId) => {
    // Immediately remove from New Leads in UI
    setLeads(prev =>
      prev.map(l => l.id === leadId ? { ...l, status: 'contacted', is_tracked: true } : l)
    );
    try {
      await axios.patch(`${API_BASE}/api/admin/leads/${leadId}`, { status: 'contacted', is_tracked: true }, { headers });
      Swal.fire({
        title: 'Contacted & Tracked!',
        text: 'Lead moved to Tracked Leads.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      // Do NOT fetchLeads() here — it would overwrite the optimistic update
    } catch (err) {
      fetchLeads(); // on error, revert to real DB state
      Swal.fire('Error', 'Failed to update. Please try again.', 'error');
    }
  };

  const untrackLead = async (leadId) => {
    // Optimistic update: move back to new and clear is_tracked
    setLeads(prev =>
      prev.map(l => l.id === leadId ? { ...l, status: 'new', is_tracked: false } : l)
    );
    try {
      await axios.patch(`${API_BASE}/api/admin/leads/${leadId}`, { status: 'new', is_tracked: false }, { headers });
      Swal.fire({
        title: 'Moved Back',
        text: 'The lead has been moved back to New Leads.',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
      fetchLeads();
    } catch (err) {
      fetchLeads();
      Swal.fire('Error', 'Failed to untrack lead', 'error');
    }
  };

  const addNote = async (leadId, noteText) => {
    // Optimistic update: add note to UI immediately
    const tempNote = { id: Date.now(), note: noteText, created_at: new Date().toISOString() };
    setLeads(prev =>
      prev.map(l => l.id === leadId
        ? { ...l, notes: [...(l.notes || []), tempNote] }
        : l
      )
    );
    try {
      await axios.post(`${API_BASE}/api/admin/leads/${leadId}/notes`, { note: noteText }, { headers });
      fetchLeads(); // sync to get real note id from db
    } catch (err) {
      fetchLeads(); // revert
      Swal.fire('Error', 'Failed to add note', 'error');
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      await axios.post(`${API_BASE}/api/admin/create`, adminForm, { headers });
      Swal.fire('Success', `Admin "${adminForm.email}" created!`, 'success');
      setAdminForm({ email: '', password: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create admin';
      Swal.fire('Error', msg, 'error');
    } finally {
      setCreatingAdmin(false);
    }
  };

  // A lead is "new" only if status is 'new' AND is_tracked is not true
  const newLeads = leads.filter(l => l.status === 'new' && !l.is_tracked);
  // A lead is "tracked" if status is not 'new' OR is_tracked is true
  const trackedLeads = leads.filter(l => l.status !== 'new' || l.is_tracked);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={fetchLeads} className="btn-secondary"><Clock size={16} /> Refresh Data</button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          <BookOpen size={16} /> New Leads
          <span className="chip-count" style={{marginLeft: '8px'}}>{newLeads.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tracked' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracked')}
        >
          <CheckCircle size={16} /> Tracked Leads
          <span className="chip-count" style={{marginLeft: '8px'}}>{trackedLeads.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          <ShieldPlus size={16} /> Manage Admins
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        
        {/* NEW LEADS TAB */}
        {activeTab === 'new' && (
          <LeadList 
            leads={newLeads}
            loading={loading}
            emptyMessage="No new leads. Great job!"
            isTrackedView={false}
            onAddNote={addNote}
            onMarkContacted={markAsContactedAndTrack}
          />
        )}

        {/* TRACKED LEADS TAB */}
        {activeTab === 'tracked' && (
          <LeadList 
            leads={trackedLeads}
            loading={loading}
            emptyMessage={<>No tracked leads yet.<br />Contact a new lead to start tracking it here.</>}
            isTrackedView={true}
            onAddNote={addNote}
            onUntrack={untrackLead}
          />
        )}

        {/* MANAGE ADMINS TAB */}
        {activeTab === 'admins' && (
          <div className="admin-manager">
            <h2>Add New Admin</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Create a new admin account with email and password access.</p>
            <form onSubmit={createAdmin} className="admin-form">
              <div className="form-group">
                <label><Mail size={15} /> Email</label>
                <input
                  type="email"
                  placeholder="newadmin@example.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>🔒 Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  minLength={6}
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={creatingAdmin}>
                <ShieldPlus size={18} /> {creatingAdmin ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
