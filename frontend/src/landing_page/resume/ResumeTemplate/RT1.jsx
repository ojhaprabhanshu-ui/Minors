import React from 'react';
import { useNavigate } from 'react-router-dom';

function RT1() {
  const navigate = useNavigate();

  const styles = {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '80px 20px',
      background: 'radial-gradient(circle at center, #f4f7ff 0%, #ffffff 70%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#1a1d20',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#eef4ff',
      color: '#2563eb',
      fontSize: '14px',
      fontWeight: '500',
      padding: '6px 16px',
      borderRadius: '20px',
      marginBottom: '24px',
      border: '1px solid #dbebe',
    },
    heading: {
      fontSize: '56px',
      fontWeight: '800',
      lineHeight: '1.15',
      letterSpacing: '-1px',
      margin: '0 0 20px 0',
      maxWidth: '800px',
      color: '#0f172a',
    },
    highlightText: {
      color: '#2563eb',
      display: 'block',
    },
    subtext: {
      fontSize: '18px',
      color: '#64748b',
      maxWidth: '600px',
      lineHeight: '1.6',
      margin: '0 auto 36px auto',
    },
    button: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      padding: '14px 32px',
      borderRadius: '30px',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)',
      transition: 'transform 0.2s ease, background-color 0.2s ease',
      marginBottom: '40px',
    },
    featuresContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      flexWrap: 'wrap',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#475569',
    },
    checkIcon: {
      width: '18px',
      height: '18px',
      backgroundColor: '#10b981',
      color: '#ffffff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
    }
  };

  return (
    <section style={styles.section}>
      {/* Top Pill / Badge */}
      <div style={styles.badge}>
        <span>✦</span> Expertly Crafted Formats
      </div>

      {/* Main Headline */}
      <h1 style={styles.heading}>
        Standout layouts engineered <span style={styles.highlightText}>for your career growth.</span>
      </h1>

      {/* Subtitle */}
      <p style={styles.subtext}>
        Modern resume frameworks tailored by industry experts to highlight your strengths.
        Effortlessly build a polished profile that gets noticed instantly.
      </p>

      {/* CTA Button */}
      <button
        type="button"
        style={styles.button}
        onClick={() => navigate('/resume/builder/resumeform')}
      >
        Build Your Resume <span>→</span>
      </button>

      {/* Feature Highlights */}
      <div style={styles.featuresContainer}>
        <div style={styles.featureItem}>
          <span style={styles.checkIcon}>✓</span> Fully ATS-Friendly
        </div>
        <div style={styles.featureItem}>
          <span style={styles.checkIcon}>✓</span> Modern Layouts
        </div>
        <div style={styles.featureItem}>
          <span style={styles.checkIcon}>✓</span> Effortless Customization
        </div>
      </div>
    </section>
  );
}

export default RT1;