import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoImage from "./Images/logo.webp";
import "./css/Navbar.css";

const NAV_CONFIG = [
  {
    type: "dropdown",
    id: "resume",
    label: "Resume",
    items: [
      { label: "Resume Builder", href: "/resume/builder" },
      { label: "Resume Templates", href: "/resume/templates" },
      
      { label: "Check ATS score", href: "/resumeATS" },
    ],
  },
  {
    type: "dropdown",
    id: "cv",
    label: "CV Builder",
    items: [
      { label: "CV Builder", href: "/cv/builder" },
      { label: "CV Templates", href: "/cv/templates" },
      
    ],
  },
  { type: "link", label: "Blog", href: "/blog" },
  { type: "link", label: "AI Interview Coach", href: "/AiInterviewcoach" },
];

function Dropdown({ label, items, isOpen, onToggle, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    // Attach click listener only when open, with subtle delay so toggle click isn't captured
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        type="button"
        className={`nav-link nav-dropdown-trigger ${isOpen ? "active" : ""}`}
        onClick={onToggle}
      >
        {label}
        <svg
          className={`chevron ${isOpen ? "chevron-up" : ""}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="nav-dropdown-menu">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="nav-dropdown-item"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close menus when route/pathname changes
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const closeMenu = () => setOpenMenu(null);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="navbar-header">
      <Link to="/" className="standalone-logo">
        <img src={logoImage} alt="Vireza" className="logo-img" />
      </Link>

      <div className="navbar-container">
        <nav className="navbar-links">
          {NAV_CONFIG.map((item) =>
            item.type === "dropdown" ? (
              <Dropdown
                key={item.id}
                label={item.label}
                items={item.items}
                isOpen={openMenu === item.id}
                onToggle={() => toggleMenu(item.id)}
                onClose={closeMenu}
              />
            ) : (
              <Link key={item.href} to={item.href} className="nav-link">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="nav-login">
            Sign In
          </Link>
          <Link to="/signup" className="cta-button">
            Get Started
          </Link>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className={mobileOpen ? "open" : ""} />
            <span className={mobileOpen ? "open" : ""} />
            <span className={mobileOpen ? "open" : ""} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/resume/builder" onClick={closeMobileMenu}>
            Resume Builder
          </Link>
          <Link to="/resume/templates" onClick={closeMobileMenu}>
            Resume Templates
          </Link>

          <Link to="/resumeATS" onClick={closeMobileMenu}>
            Check ATS Score
          </Link>

          <Link to="/cv/builder" onClick={closeMobileMenu}>
            CV Builder
          </Link>
          <Link to="/cv/templates" onClick={closeMobileMenu}>
            CV Templates
          </Link>
          

          

          <Link to="/blog" onClick={closeMobileMenu}>
            Blog
          </Link>
          <Link to="/AiInterviewcoach" onClick={closeMobileMenu}>
            AI Interview Coach
          </Link>

          <div className="mobile-menu-divider" />
          <Link to="/login" onClick={closeMobileMenu}>
            Sign In
          </Link>
          <Link
            to="/signup"
            className="cta-button cta-button-mobile"
            onClick={closeMobileMenu}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
};
