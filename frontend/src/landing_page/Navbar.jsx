import { useState, useRef, useEffect } from "react";
import logoImage from "./Images/logo.webp";
import "./css/Navbar.css";

const RESUME_LINKS = [
  { label: "Resume Builder", href: "/resume/builder" },
  { label: "Resume Templates", href: "/resume/templates" },
  { label: "Resume Examples", href: "/resume/examples" },
  { label: "Check ATS score", href: "/resume/ATS" }
];

const CV_LINKS = [
  { label: "CV Builder", href: "/cv/builder" },
  { label: "CV Templates", href: "/cv/templates" },
  { label: "CV Examples", href: "/cv/examples" },
];

const COVER_LETTER_LINKS = [
  { label: "Cover Letter Builder", href: "/cover-letter/builder" },
  { label: "Cover Letter Templates", href: "/cover-letter/templates" },
  { label: "Cover Letter Examples", href: "/cover-letter/examples" },
];

function Dropdown({ label, items, isOpen, onToggle, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        className={`nav-link nav-dropdown-trigger ${isOpen ? "active" : ""}`}
        onClick={onToggle}
        type="button"
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
            <a key={item.href} href={item.href} className="nav-dropdown-item">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const closeMenu = () => setOpenMenu(null);

  return (
    <header className="navbar-header">
      {/* Alag Leftmost Logo */}
      <a href="/" className="standalone-logo">
        <img src={logoImage} alt="Vireza" className="logo-img" />
      </a>

      {/* Floating Options Menu Pill Container */}
      <div className="navbar-container">
        <nav className="navbar-links">
          <Dropdown
            label="Resume"
            items={RESUME_LINKS}
            isOpen={openMenu === "resume"}
            onToggle={() => toggleMenu("resume")}
            onClose={closeMenu}
          />

          <Dropdown
            label="CV Builder"
            items={CV_LINKS}
            isOpen={openMenu === "cv"}
            onToggle={() => toggleMenu("cv")}
            onClose={closeMenu}
          />

          <Dropdown
            label="Cover Letter"
            items={COVER_LETTER_LINKS}
            isOpen={openMenu === "coverLetter"}
            onToggle={() => toggleMenu("coverLetter")}
            onClose={closeMenu}
          />

          <a href="/blog" className="nav-link">
            Blog
          </a>
          <a href="/AiInterviewcoach" className="nav-link">
            AI Interview Coach
          </a>
        </nav>

        <div className="navbar-actions">
          <a href="/login" className="nav-login">
            Sign In
          </a>
          <a href="/signup" className="cta-button">
            Get Started
          </a>

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            type="button"
          >
            <span className={mobileOpen ? "open" : ""} />
            <span className={mobileOpen ? "open" : ""} />
            <span className={mobileOpen ? "open" : ""} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <a href="/resume/builder">Resume</a>
          <a href="/cv/builder">CV Builder</a>
          <a href="/cover-letter/builder">Cover Letter</a>
          <a href="/blog">Blog</a>
          <a href="/dashboard">Dashboard</a>
          <div className="mobile-menu-divider" />
          <a href="/login">Sign In</a>
          <a href="/signup" className="cta-button cta-button-mobile">
            Get Started
          </a>
        </div>
      )}
    </header>
  );
}