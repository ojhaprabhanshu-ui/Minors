import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BlogImg5 from "../../resources/images/BLOGIMG5.webp";

function BLOG5() {
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 20px", maxWidth: "1280px", margin: "0 auto", color: "#111827" }}>
            
            {/* Inline CSS for Table of Contents hover and custom scrollbar */}
            <style>
                {`
                    .toc-link {
                        background: none;
                        border: none;
                        color: #4B5563;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 0.85rem;
                        text-align: left;
                        padding: 0;
                        line-height: 1.4;
                        transition: color 0.25s ease, transform 0.2s ease;
                    }
                    .toc-link:hover {
                        color: #276EF5;
                        transform: translateX(4px);
                    }
                    .toc-container::-webkit-scrollbar {
                        width: 6px;
                    }
                    .toc-container::-webkit-scrollbar-thumb {
                        background-color: #cbd5e1;
                        border-radius: 4px;
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
                        ATS-Ready Resume Builder 2026: Best Practices, Formats & Real Examples
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
                        src={BlogImg5} 
                        alt="ATS-Ready Resume Builder 2026" 
                        style={{ width: "100%", height: "auto", display: "block" }} 
                    />
                </div>
            </div>

            {/* Main Content Layout: Left Sidebar (Sticky TOC) + Right Detailed Article Body */}
            <div style={{ display: "flex", gap: "50px", alignItems: "flex-start", position: "relative", flexWrap: "wrap" }}>
                
                {/* Left Sticky Sidebar: Table of Contents */}
                <div style={{ 
                    flex: "0 0 320px", 
                    position: "sticky", 
                    top: "30px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
                    overflow: "hidden"
                }}>
                    <div style={{ background: "linear-gradient(135deg, #276EF5, #1d4ed8)", padding: "16px 20px", color: "#ffffff", fontWeight: "700", fontSize: "1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Table Of Contents</span>
                        <span>▲</span>
                    </div>
                    <div className="toc-container" style={{ padding: "20px", maxHeight: "calc(100vh - 180px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
                        <button onClick={() => scrollToSection("what-is-ats")} className="toc-link">1. What is an ATS (Applicant Tracking System)?</button>
                        <button onClick={() => scrollToSection("why-ats-matters-2026")} className="toc-link">2. Why ATS-Ready Resumes Matter in 2026</button>
                        <button onClick={() => scrollToSection("core-features")} className="toc-link">3. Core Features of an ATS-Ready Resume Builder</button>
                        <button onClick={() => scrollToSection("best-practices")} className="toc-link">4. Best Practices for ATS Optimization</button>
                        <button onClick={() => scrollToSection("formatting-rules")} className="toc-link">5. Formatting Rules to Avoid Rejection</button>
                        <button onClick={() => scrollToSection("real-examples")} className="toc-link">6. Real Examples & Structural Frameworks</button>
                        <button onClick={() => scrollToSection("common-mistakes")} className="toc-link">7. Common ATS Mistakes to Avoid</button>
                        <button onClick={() => scrollToSection("conclusion")} className="toc-link">8. Conclusion & Accelerate with Vireza</button>
                    </div>
                </div>

                {/* Right Side: Deeply Detailed Article Content */}
                <div style={{ flex: "1", minWidth: "300px", lineHeight: "1.8", color: "#374151", fontSize: "1.05rem", display: "flex", flexDirection: "column", gap: "55px" }}>
                    
                    <section id="what-is-ats">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>1. What is an ATS (Applicant Tracking System)?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            An Applicant Tracking System (ATS) is specialized recruitment software used by over 97% of Fortune 500 companies and growing numbers of startups to manage high volumes of job applications. The ATS parses incoming resumes, extracts core data points (such as work history, contact info, education, and skills), matches them against the employer's job description keywords, and ranks candidates accordingly before a human ever looks at the file.
                        </p>
                    </section>

                    <section id="why-ats-matters-2026">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>2. Why ATS-Ready Resumes Matter in 2026</h2>
                        <p style={{ marginBottom: "16px" }}>
                            As automated filtering becomes increasingly advanced, a beautifully designed resume with complex graphics, multi-column grids, text boxes, or hidden tables will often get completely scrambled or rejected by parser bots. In 2026, ensuring your resume is fully ATS-optimized is no longer optional—it is the primary gateway to landing interviews.
                        </p>
                    </section>

                    <section id="core-features">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>3. Core Features of an ATS-Ready Resume Builder</h2>
                        <p style={{ marginBottom: "16px" }}>
                            A top-tier resume builder must support clean semantic HTML/PDF layouts, standard section headings (Experience, Education, Skills), font pairing optimization, and automated keyword matching that aligns your profile directly with target job postings.
                        </p>
                    </section>

                    <section id="best-practices">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>4. Best Practices for ATS Optimization</h2>
                        <p style={{ marginBottom: "16px" }}>
                            To maximize your match rate, always incorporate exact-match keywords from the job description, write clean accomplishment-driven bullet points, and save your document in standard text-selectable PDF or DOCX formats.
                        </p>
                    </section>

                    <section id="formatting-rules">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>5. Formatting Rules to Avoid Rejection</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Avoid using headers and footers for crucial text, refrain from putting text inside graphical shapes or images, avoid multi-column layouts that confuse parsers, and stick to standard system fonts like Arial, Calibri, or Helvetica.
                        </p>
                    </section>

                    <section id="real-examples">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>6. Real Examples & Structural Frameworks</h2>
                        <p style={{ marginBottom: "16px" }}>
                            A winning ATS resume structure relies on a chronological flow: Clear Contact Info, Professional Summary, Core Competencies Matrix, Professional Experience with metric-driven bullet points, and Formal Education.
                        </p>
                    </section>

                    <section id="common-mistakes">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>7. Common ATS Mistakes to Avoid</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Avoid keyword stuffing (inserting random industry terms in white text), using creative unstandardized section titles like "My Journey" instead of "Work Experience", and submitting image-only resumes.
                        </p>
                    </section>

                    <section id="conclusion">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>8. Conclusion & Accelerate with Vireza</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Building an ATS-compliant resume ensures your application successfully passes automated gatekeepers every time. Leverage Vireza's advanced resume builder tools to format your career history perfectly and land more interviews in 2026!
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
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Published</div>
                    <div>August 18, 2026</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Last Updated</div>
                    <div>August 28, 2026</div>
                </div>
            </div>

        </div>
    );
}

export default BLOG5;