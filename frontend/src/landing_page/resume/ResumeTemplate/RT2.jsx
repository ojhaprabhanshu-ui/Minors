import React from 'react';
import { useNavigate } from 'react-router-dom';

function RT2() {
  const navigate = useNavigate();

  const cardsData = [
    {
      title: 'CHRONOLOGICAL RESUME FORMAT',
      badgeBg: '#1d6bf3',
      badgeColor: '#ffffff',
      cardBg: '#f0f5ff',
      borderColor: '#d0e1fd',
      sections: [
        { label: 'PERSONAL INFO', height: '40px', bg: '#dbeafe', color: '#1d6bf3', weight: '600' },
        { label: 'EXPERIENCE', height: '70px', bg: '#edf4ff', color: '#1d6bf3', weight: '700' },
        { label: 'EDUCATION', height: '40px', bg: '#f8fafc', color: '#64748b', weight: '600' },
        { label: 'SKILLS', height: '40px', bg: '#f8fafc', color: '#64748b', weight: '600' },
      ],
      bullets: [
        'You have consistent career progression in your current industry.',
        "You've built a professional career within a single field of expertise.",
        "You're applying for a role that is similar to your current position.",
      ],
    },
    {
      title: 'FUNCTIONAL RESUME FORMAT',
      badgeBg: '#e67e22',
      badgeColor: '#ffffff',
      cardBg: '#fffdf0',
      borderColor: '#fef3c7',
      sections: [
        { label: 'PERSONAL INFO', height: '40px', bg: '#fef3c7', color: '#d97706', weight: '600' },
        { label: 'SKILLS', height: '70px', bg: '#fffbeb', color: '#d97706', weight: '700' },
        { label: 'EXPERIENCE', height: '40px', bg: '#f8fafc', color: '#64748b', weight: '600' },
        { label: 'EDUCATION', height: '40px', bg: '#f8fafc', color: '#64748b', weight: '600' },
      ],
      bullets: [
        "You're changing to a new career path and need to highlight key skills.",
        'You have freelance or varied work experience that you want to showcase.',
        "You're applying for a mid-level role that values diverse qualifications.",
      ],
    },
    {
      title: 'COMBINATION RESUME FORMAT',
      badgeBg: '#e11d48',
      badgeColor: '#ffffff',
      cardBg: '#fff5f5',
      borderColor: '#ffe4e6',
      sections: [
        { label: 'PERSONAL INFO', height: '40px', bg: '#ffe4e6', color: '#e11d48', weight: '600' },
        { label: 'SKILLS', height: '70px', bg: '#fff1f2', color: '#e11d48', weight: '700' },
        { label: 'EXPERIENCE', height: '40px', bg: '#f8fafc', color: '#64748b', weight: '600' },
        { label: 'EDUCATION', height: '40px', bg: '#f8fafc', color: '#64748b', weight: '600' },
      ],
      bullets: [
        "You're a recent graduate with limited professional experience to highlight.",
        'You have gaps in your work history and want to focus on other areas.',
        "You're applying for an entry-level role that emphasizes skills over experience.",
      ],
    },
  ];

  const styles = {
    container: {
      padding: '60px 20px',
      maxWidth: '1240px',
      margin: '0 auto',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#1e293b',
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px',
    },
    title: {
      fontSize: '40px',
      fontWeight: '800',
      color: '#1e293b',
      margin: '0 0 16px 0',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '17px',
      color: '#64748b',
      maxWidth: '720px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '48px',
    },
    card: (bg, border) => ({
      backgroundColor: bg,
      borderRadius: '20px',
      padding: '24px',
      border: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
    }),
    badgeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '20px',
    },
    badge: (bg, color) => ({
      backgroundColor: bg,
      color: color,
      fontSize: '11px',
      fontWeight: '700',
      padding: '6px 12px',
      borderRadius: '20px',
      letterSpacing: '0.5px',
    }),
    infoIcon: {
      color: '#94a3b8',
      fontSize: '14px',
      cursor: 'pointer',
    },
    previewBox: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '24px',
    },
    previewSection: (height, bg, color, weight) => ({
      height: height,
      backgroundColor: bg,
      color: color,
      fontWeight: weight,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      letterSpacing: '0.5px',
    }),
    bulletsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      marginTop: 'auto',
    },
    bulletItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      fontSize: '13.5px',
      color: '#475569',
      lineHeight: '1.45',
    },
    checkIcon: {
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold',
      flexShrink: 0,
      marginTop: '1px',
    },
    btnContainer: {
      textAlign: 'center',
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
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>How to Choose the Right Resume Format</h2>
        <p style={styles.subtitle}>
          Our collection of resume templates includes a variety of resume formats, each designed to
          match different career stages and highlight your most relevant qualifications.
        </p>
      </div>

      {/* 3 Columns Grid */}
      <div style={styles.grid}>
        {cardsData.map((card, idx) => (
          <div key={idx} style={styles.card(card.cardBg, card.borderColor)}>
            {/* Format Badge */}
            <div style={styles.badgeContainer}>
              <span style={styles.badge(card.badgeBg, card.badgeColor)}>{card.title}</span>
              <span style={styles.infoIcon}>ⓘ</span>
            </div>

            {/* Resume Structural Wireframe */}
            <div style={styles.previewBox}>
              {card.sections.map((sec, secIdx) => (
                <div
                  key={secIdx}
                  style={styles.previewSection(sec.height, sec.bg, sec.color, sec.weight)}
                >
                  {sec.label}
                </div>
              ))}
            </div>

            {/* Checklist items */}
            <div style={styles.bulletsList}>
              {card.bullets.map((text, bIdx) => (
                <div key={bIdx} style={styles.bulletItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div style={styles.btnContainer}>
        <button
          type="button"
          style={styles.button}
          onClick={() => navigate('/resume/builder/resumeform')}
        >
          Build my resume <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default RT2;