import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, 
  HelpCircle, MessageSquare, Clock, School, AlertCircle
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    category: 'Voter Registration',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'How do I know my vote is 100% secret and anonymous?',
      a: 'The system uses an HMAC-SHA256 one-way deterministic hashing engine. When you cast your vote, your ballot is separated from your student identity before being saved to the database. Even system administrators cannot trace votes back to individual voters.'
    },
    {
      q: 'What happens if I try to vote more than once?',
      a: 'Double voting is strictly prohibited and mathematically prevented by compound unique constraints at the database engine level. If a duplicate ballot is detected, it is rejected immediately with an error.'
    },
    {
      q: 'Can I change my vote after submitting?',
      a: 'No. To preserve democratic integrity and audit consistency, all submitted votes are permanently sealed and immutable.'
    },
    {
      q: 'Who can nominate themselves for Student Council positions?',
      a: 'Any verified student who meets the university eligibility criteria (minimum attendance & GPA thresholds) can self-nominate from the Student Portal during the open nomination period.'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: 50 }}>
      {/* 1. Header */}
      <div className="glass-panel" style={{ padding: '28px 32px', marginBottom: 24, background: 'linear-gradient(135deg, rgba(14, 20, 36, 0.95), rgba(7, 10, 18, 0.98))' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', marginBottom: 8 }}>
          <School size={14} color="#38bdf8" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Election Helpdesk & Support
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
          Contact Election Commission
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: 6, maxWidth: 620 }}>
          Have questions regarding voter eligibility, candidate registration, or reporting an election issue? Get in touch with the Marwadi University Election Committee.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 26, marginBottom: 36 }}>
        {/* Contact Info Card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Official Commission Headquarters</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', background: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Campus Office</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 2, lineHeight: 1.5 }}>
                  Office of Student Welfare (Block A, 2nd Floor)<br />
                  Marwadi University, Rajkot-Morbi Highway, Gujarat, India.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', background: 'rgba(0, 168, 150, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00a896', flexShrink: 0 }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Email Helpdesk</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 2 }}>
                  elections@marwadiuniversity.ac.in<br />
                  support.voting@marwadiuniversity.ac.in
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Helpline Numbers</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 2 }}>
                  +91 (0281) 7123456 (General Inquiries)<br />
                  +91 (0281) 7123499 (Grievance Cell)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', flexShrink: 0 }}>
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Operating Hours</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 2 }}>
                  Monday – Saturday: 9:00 AM – 5:30 PM<br />
                  Voting Days: 24/7 Digital Operations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grievance & Help Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Submit an Inquiry or Grievance</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: 20 }}>
            Direct message to the Election Returning Officer. Responses within 24 hours.
          </p>

          {submitted ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <CheckCircle2 size={44} color="#10b981" style={{ marginBottom: 12 }} />
              <h4 style={{ fontSize: '1.15rem', color: '#34d399' }}>Message Received Successfully!</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: 6 }}>
                Your ticket ID is <strong>TKT-2026-{Math.floor(1000 + Math.random() * 9000)}</strong>. A committee officer has been assigned.
              </p>
              <button className="btn btn-secondary" style={{ marginTop: 16, borderRadius: 'var(--radius-pill)' }} onClick={() => setSubmitted(false)}>
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Enrollment / Roll No</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. STU-2026-001"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="student@marwadiuniversity.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Inquiry Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Voter Registration">Voter Registration</option>
                    <option value="Candidate Nomination">Candidate Nomination</option>
                    <option value="Technical Glitch">Technical / Login Issue</option>
                    <option value="Election Rule Violation">Election Rule Grievance</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="form-label">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  className="form-textarea"
                  placeholder="Explain your inquiry or issue with specific details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>
                <Send size={15} /> Send Message to Election Committee
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HelpCircle size={22} color="#38bdf8" />
          <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Frequently Asked Questions</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: 8 }}>{faq.q}</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
