import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Send, User, Mail, MessageSquare, Phone, Filter } from 'lucide-react';

function LeadForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', source: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

      await axios.post(`${API_BASE}/api/leads`, formData);
      Swal.fire({
        title: 'Thank You!',
        text: 'We have received your details and will contact you shortly.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
      setFormData({ name: '', email: '', phone: '', source: '', message: '' });
    } catch (err) {
      Swal.fire('Error', 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Get in Touch</h1>
        <p>Fill out the form below and we'll get back to you shortly.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label><User size={16} /> Full Name</label>
          <input 
            type="text" 
            placeholder="John Doe" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
        </div>
        <div className="form-group-row">
            <div className="form-group" style={{ flex: 1 }}>
                <label><Mail size={16} /> Email Address</label>
                <input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
                <label><Phone size={16} /> Phone Number</label>
                <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
            </div>
        </div>
        <div className="form-group">
          <label><Filter size={16} /> How did you hear about us?</label>
          <select 
            value={formData.source} 
            onChange={(e) => setFormData({...formData, source: e.target.value})}
          >
            <option value="">Select an option</option>
            <option value="Google Search">Google Search</option>
            <option value="Social Media">Social Media</option>
            <option value="Friend/Referral">Friend / Referral</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label><MessageSquare size={16} /> Your Message</label>
          <textarea 
            rows="4" 
            placeholder="How can we help you today?" 
            value={formData.message} 
            onChange={(e) => setFormData({...formData, message: e.target.value})} 
            required 
          />
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Sending...' : <><Send size={18} /> Send Message</>}
        </button>
      </form>
    </div>
  );
}

export default LeadForm;

