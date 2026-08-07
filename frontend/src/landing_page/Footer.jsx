import React from 'react';
import './css/Footer.css';

const Footer = () => {
    return (
        <footer className="vireza-footer">
            <div className="footer-container">
                {/* Brand Column */}
                <div className="footer-col brand-col">
                    <div className="brand-logo">
                        {/* Simple placeholder shield/wings SVG */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <h2>Vireza.io</h2>
                    </div>
                    <p>Vireza.io helps you create smart, ATS-friendly resumes that get noticed by recruiters and land interviews faster.</p>
                </div>

                {/* Quick Links Column */}
                <div className="footer-col">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#about">About Us</a></li>
                        <li><a href="#contact">Contact Us</a></li>
                    </ul>
                </div>

                {/* Social Column */}
                <div className="footer-col">
                    <h3>Social</h3>
                    <ul>
                        <li><a href="#instagram">Instagram</a></li>
                        <li><a href="#linkedin">Linkedin</a></li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div className="footer-col">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="#privacy">Privacy Policy</a></li>
                        <li><a href="#terms">Terms & Conditions</a></li>
                        
                    </ul>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Vireza.io &bull; All Rights Reserved</p>
            </div>
        </footer>
    );
};

export default Footer;