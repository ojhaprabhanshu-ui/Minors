import React, { useState } from 'react';

// Sub-component for individual check items with hover effect
function CheckBadge({ label }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? '#e6f7ef' : '#f8fafc',
        border: isHovered ? '1px solid #6ddc95' : '1px solid #f1f5f9',
        borderRadius: '12px',
        padding: '0.85rem 1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 6px 15px rgba(109, 220, 149, 0.2)' : 'none',
        transition: 'all 0.25s ease'
      }}
    >
      {/* Green Checkmark Circle Icon */}
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#00d084',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Label Text */}
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: '500',
          color: isHovered ? '#0f172a' : '#334155'
        }}
      >
        {label}
      </span>

    </div>
  );
}

export default function AdditionalChecksCard() {
  const checks = [
    'ATS Parse Rate',
    'Keyword Density',
    'File Format',
    'Section Headings',
    'Contact Information',
    'Education Formatting',
    'Work Experience Dates',
    'Skill Section Analysis',
    'Measurable Results',
    'Active Voice Usage',
    'Spelling & Grammar',
    'Length & Brevity',
    'Bullet Point Structure',
    'Chronological Order'
  ];

  return (
    <div className="container my-5">
      <div
        className="p-4 p-md-5 bg-white"
        style={{
          borderRadius: '24px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f0f0f0'
        }}
      >
        {/* Header Title */}
        <h3 className="fw-bold mb-4 text-dark" style={{ fontSize: '1.6rem' }}>
          Plus 14+ Additional Checks
        </h3>

        {/* Grid Layout (4 columns on larger screens, 2 on tablet, 1 on mobile) */}
        <div className="row g-3">
          {checks.map((item, index) => (
            <div className="col-12 col-sm-6 col-lg-3" key={index}>
              <CheckBadge label={item} />
            </div>
          ))}
        </div>
    
      </div>
      <div className="text-center mt-4">
        <button
          type="button"
          className="btn btn-dark fs-5 px-5 py-3 rounded-pill shadow-sm"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Get Your Detailed ATS Report <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}