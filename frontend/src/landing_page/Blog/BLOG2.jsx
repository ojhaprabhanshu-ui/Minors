import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BlogImg2 from "../../resources/images/BLOGIMG2.webp";

function BLOG2() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 20px", maxWidth: "1280px", margin: "0 auto", color: "#111827" }}>
            
            {/* Inline CSS for Table of Contents link hover effect */}
            <style>
                {`
                    .toc-link {
                        background: none;
                        border: none;
                        color: #4B5563;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 0.9rem;
                        text-align: left;
                        padding: 0;
                        line-height: 1.4;
                        transition: color 0.25s ease, transform 0.2s ease;
                    }
                    .toc-link:hover {
                        color: #276EF5;
                        transform: translateX(4px);
                    }
                `}
            </style>

            {/* Back to Blog Link */}
            <Link 
                to="/blog" 
                style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    textDecoration: "none", 
                    color: "#4B5563", 
                    fontWeight: "600", 
                    marginBottom: "32px",
                    fontSize: "0.95rem"
                }}
            >
                ← Back to Blog
            </Link>

            {/* Top Hero Layout Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "40px", flexWrap: "wrap", marginBottom: "50px" }}>
                <div style={{ flex: "1", minWidth: "300px", maxWidth: "650px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                        <span style={{ backgroundColor: "#FFEDD5", color: "#C2410C", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700" }}>
                            Article
                        </span>
                        <span style={{ color: "#6B7280", fontSize: "0.85rem", fontWeight: "500" }}>
                            12 min read
                        </span>
                    </div>

                    <h1 style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "20px", color: "#111827" }}>
                        International CV & Resume Format: Best Practices & Examples (Complete Guide)
                    </h1>

                    <p style={{ color: "#4B5563", fontSize: "1.1rem", marginBottom: "30px", lineHeight: "1.5" }}>
                        Build your resume with Vireza and land your dream job faster.
                    </p>

                    <button 
                        onClick={() => navigate("/resume/builder")}
                        style={{
                            backgroundColor: "#276EF5",
                            color: "#ffffff",
                            border: "none",
                            padding: "12px 24px",
                            borderRadius: "10px",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(39, 110, 245, 0.3)"
                        }}
                    >
                        Build Your Resume
                    </button>
                </div>

                <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #f3f4f6",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                    width: "450px",
                    maxWidth: "100%"
                }}>
                    <img 
                        src={BlogImg2} 
                        alt="International CV & Resume Format" 
                        style={{ width: "100%", height: "auto", display: "block" }} 
                    />
                </div>
            </div>

            {/* Main Content Layout: Left Sidebar (Sticky TOC) + Right Detailed Article Body */}
            <div style={{ display: "flex", gap: "50px", alignItems: "flex-start", position: "relative", flexWrap: "wrap" }}>
                
                {/* Left Sticky Sidebar: Table of Contents */}
                <div style={{ 
                    flex: "0 0 300px", 
                    position: "sticky", 
                    top: "30px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
                }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: "#1F2937", borderBottom: "2px solid #E5E7EB", paddingBottom: "8px" }}>
                        Table Of Contents
                    </h3>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                        <li>
                            <button onClick={() => scrollToSection("intro")} className="toc-link">
                                1. Introduction: Why Your Resume Needs an International Upgrade?
                            </button>
                        </li>
                        <li>
                            <button onClick={() => scrollToSection("understanding-format")} className="toc-link">
                                2. Understanding the International Resume Format
                            </button>
                        </li>
                        <li>
                            <button onClick={() => scrollToSection("cv-vs-resume")} className="toc-link">
                                3. International Resume vs. International CV: Key Differences
                            </button>
                        </li>
                        <li>
                            <button onClick={() => scrollToSection("universal-structure")} className="toc-link">
                                4. Universal Structure for an International Resume Format
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Right Side: Deeply Detailed Article Content */}
                <div style={{ flex: "1", minWidth: "300px", lineHeight: "1.8", color: "#374151", fontSize: "1.05rem", display: "flex", flexDirection: "column", gap: "50px" }}>
                    
                    {/* Section 1 */}
                    <section id="intro">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            1. Introduction: Why Your Resume Needs an International Upgrade?
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            In today's hyper-connected, globalized job market, geographical borders are no longer barriers to career advancement. Professionals frequently apply for roles across multinational corporations, remote overseas companies, or relocate internationally. However, a resume tailored solely for local standards will often fail to impress foreign recruiters.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Different countries maintain unique cultural norms, expectations, and compliance laws regarding application documents. For instance, while certain regions emphasize personal details like photographs or dates of birth, other major economic hubs strictly forbid them to prevent hiring bias. Upgrading to an international standard ensures your qualifications transcend cultural gaps seamlessly.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Adapting your credentials for an international audience demonstrates cross-cultural awareness, adaptability, and high professional polish. It ensures that international hiring managers immediately understand your career metrics without getting bogged down by regional formatting anomalies.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section id="understanding-format">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            2. Understanding the International Resume Format
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            An international resume format is a universally optimized professional document designed to appeal to recruiters worldwide. It balances clarity, conciseness, and ATS compliance while omitting region-specific clichés or restricted personal disclosures.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Global recruiters look for clean layouts, uniform date formats (such as Month Year), and results-oriented language. Standardizing your achievements into universal metrics allows global employers to accurately benchmark your performance against international competitors.
                        </p>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1F2937", margin: "20px 0 10px" }}>Core Pillars of Global Formatting:</h3>
                        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <li><strong>Standard Paper & Margins:</strong> Designing layouts compatible with both US Letter and international A4 formats.</li>
                            <li><strong>Universal Language Clarity:</strong> Using professional, universally understood English terminology without localized slang.</li>
                            <li><strong>Neutral Personal Details:</strong> Excluding marital status, religion, national ID numbers, and photographs unless legally mandated by the target nation.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section id="cv-vs-resume">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            3. International Resume vs. International CV: Key Differences
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            A common pitfall for global job seekers is confusing a Curriculum Vitae (CV) with a resume. While North American markets use "resume" for standard industry applications and "CV" strictly for academic or research positions, Europe, the Middle East, Asia, and parts of Africa use "CV" as the standard term for all job applications.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                            <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                                <strong style={{ color: "#111827" }}>Length & Scope:</strong> An international resume is concise (1–2 pages max), focusing on recent career highlights. An international CV can span multiple pages (2–3+ pages) to comprehensively detail academic history, publications, projects, and extensive professional backgrounds.
                            </div>
                            <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                                <strong style={{ color: "#111827" }}>Regional Preferences:</strong> If you are applying within North America, a 1–2 page resume is always preferred. If you are targeting academic, medical, or European research institutions, a comprehensive international CV is mandatory.
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section id="universal-structure">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            4. Universal Structure for an International Resume Format
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            To guarantee your application passes international screening protocols, structure your document logically using universally recognized headings and sections.
                        </p>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1F2937", margin: "20px 0 10px" }}>Recommended Global Section Layout:</h3>
                        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <li><strong>Header Section:</strong> Full Name, professional email address, international phone format with country code (e.g., +1 or +44), LinkedIn profile, and GitHub/Portfolio link.</li>
                            <li><strong>Professional Summary:</strong> A high-impact executive overview tailored to global competencies.</li>
                            <li><strong>Core Competencies / Skills Matrix:</strong> Technical tools, languages, and methodologies used worldwide.</li>
                            <li><strong>Professional Experience:</strong> Reverse-chronological entries detailing company names, international locations, job titles, and bulleted achievements using the STAR method.</li>
                            <li><strong>Education & Credentials:</strong> Degree titles, institution names, graduation dates, and recognized international equivalencies.</li>
                        </ul>
                        <p style={{ marginTop: "16px" }}>
                            By building your international credentials with Vireza's structured templates, you ensure your profile meets elite global hiring standards and stands out to top multinational recruiters.
                        </p>
                    </section>

                </div>

            </div>

            {/* Bottom Metadata Bar */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                borderTop: "1px solid #e5e7eb", 
                marginTop: "80px", 
                paddingTop: "24px",
                flexWrap: "wrap",
                gap: "20px",
                color: "#6B7280",
                fontSize: "0.9rem"
            }}>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Author</div>
                    <div>Vireza Team</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Editor</div>
                    <div>Vireza Content Team</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Published</div>
                    <div>AUGUST 7, 2026</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Last Updated</div>
                    <div>AUGUST 25, 2026</div>
                </div>
            </div>

        </div>
    );
}

export default BLOG2;