import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BlogImg1 from "../../resources/images/BLOGIMG1.webp";

function BLOG1() {
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
                            11 min read
                        </span>
                    </div>

                    <h1 style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "20px", color: "#111827" }}>
                        Resume vs Cover Letter: What's the Difference and Why It Matters for Your Job Search
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
                        src={BlogImg1} 
                        alt="Resume vs Cover Letter" 
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
                        Table of Contents
                    </h3>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                        <li>
                            <button onClick={() => scrollToSection("intro")} className="toc-link">
                                1. Introduction: Why Understanding the Difference Matters
                            </button>
                        </li>
                        <li>
                            <button onClick={() => scrollToSection("what-is-resume")} className="toc-link">
                                2. What Is a Resume? (Your Career Blueprint)
                            </button>
                        </li>
                        <li>
                            <button onClick={() => scrollToSection("what-is-cover-letter")} className="toc-link">
                                3. What Is a Cover Letter? (Your Personal Pitch)
                            </button>
                        </li>
                        <li>
                            <button onClick={() => scrollToSection("core-differences")} className="toc-link">
                                4. Core Differences Between Both Documents
                            </button>
                        </li>
                        <li>
                            <button onClick={() => scrollToSection("strategic-use")} className="toc-link">
                                5. Strategic Tips to Maximize Both for Interviews
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Right Side: Deeply Detailed Article Content */}
                <div style={{ flex: "1", minWidth: "300px", lineHeight: "1.8", color: "#374151", fontSize: "1.05rem", display: "flex", flexDirection: "column", gap: "50px" }}>
                    
                    {/* Section 1 */}
                    <section id="intro">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            1. Introduction: Why Understanding the Difference Matters
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            When embarking on a professional job search, applicants must present themselves in a manner that is clear, confident, and highly structured. Your resume and your cover letter are two foundational documents that dictate your initial impression upon recruiters. Yet, many job seekers struggle to define the exact boundary between the two, often treating them as redundant duplicates or blending their structures incorrectly.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Data shows that recruiters spend an average of only 6 to 8 seconds scanning a resume. Conversely, a cover letter provides a vital window of 15 to 30 seconds to capture attention through personal tone and contextual storytelling. Recognizing that these two elements serve entirely different functions is the secret weapon of successful candidates.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Many candidates make the mistake of summarizing their entire work history inside their cover letter, or conversely, writing narrative paragraphs inside their resume bullet points. Understanding what each document requires will ensure you avoid these common traps and pass automated Applicant Tracking Systems (ATS) with flying colors.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section id="what-is-resume">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            2. What Is a Resume? (Your Career Blueprint)
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            A resume is a concise, data-driven document summarizing your professional trajectory, academic credentials, technical proficiencies, and quantifiable achievements. It functions as a structured blueprint of your career, designed for rapid evaluation by hiring managers, recruiters, and parsing algorithms.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Sometimes referred to colloquially as a "resume letter," its sole purpose is to provide verifiable proof of what you have accomplished. It relies heavily on bullet points, action verbs, and numerical metrics (e.g., "increased sales conversion by 24%") rather than long descriptive paragraphs.
                        </p>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1F2937", margin: "20px 0 10px" }}>Core Anatomy of a High-Impact Resume:</h3>
                        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <li><strong>Contact Header:</strong> Professional name, location, phone number, email, and LinkedIn or portfolio link.</li>
                            <li><strong>Professional Summary:</strong> A 3–4 sentence elevator pitch highlighting your core expertise and value proposition.</li>
                            <li><strong>Work Experience Section:</strong> Reverse-chronological history focusing on achievements and responsibilities.</li>
                            <li><strong>Skills Matrix:</strong> Categorized hard skills, tools, programming languages, or domain proficiencies relevant to the target job description.</li>
                            <li><strong>Education & Certifications:</strong> Formal degrees, academic accolades, and industry-recognized certifications.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section id="what-is-cover-letter">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            3. What Is a Cover Letter? (Your Personal Pitch)
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            While a resume provides objective data, a cover letter delivers the human narrative. It is a formal, one-page letter accompanying your resume that speaks directly to the hiring manager. It bridges the gap between your raw qualifications and your interpersonal motivation.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            A well-written cover letter answers three core questions: Why are you applying to *this specific company*? How does your unique background solve *their specific problems*? And what makes your personality and work ethic an ideal cultural fit?
                        </p>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1F2937", margin: "20px 0 10px" }}>Key Structural Components of an Effective Cover Letter:</h3>
                        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <li><strong>Personalized Salutation:</strong> Addressing the hiring manager or department head by name rather than a generic greeting.</li>
                            <li><strong>The Hook Opening:</strong> An engaging opening statement expressing genuine enthusiasm and identifying the exact role sought.</li>
                            <li><strong>The Value Proposition Body:</strong> Detailed elaboration on 1 or 2 major achievements from your resume, translated into a narrative story.</li>
                            <li><strong>Cultural Alignment:</strong> Explanation of why you resonate with the company's mission, values, or recent projects.</li>
                            <li><strong>Call-to-Action Closing:</strong> A confident sign-off proposing an interview conversation.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section id="core-differences">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            4. Core Differences Between Both Documents
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            To make informed decisions during your application process, it helps to look at how resumes and cover letters contrast across multiple dimensions:
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                            <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                                <strong style={{ color: "#111827" }}>Format & Structure:</strong> Resumes utilize strict chronological bullet points, sections, and concise fragments. Cover letters utilize formal letter formatting, paragraphs, and conversational tone.
                            </div>
                            <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                                <strong style={{ color: "#111827" }}>Primary Objective:</strong> Resumes prove your technical capabilities and historical experience. Cover letters explain your professional motivations and contextual fit.
                            </div>
                            <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                                <strong style={{ color: "#111827" }}>Automation Friendliness:</strong> Resumes are heavily scanned by ATS algorithms for keyword matching. Cover letters are almost exclusively read by human recruiters and hiring managers.
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section id="strategic-use">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>
                            5. Strategic Tips to Maximize Both for Interviews
                        </h2>
                        <p style={{ marginBottom: "16px" }}>
                            Even when application portals mark cover letters as "optional," including a tailored letter dramatically boosts your competitive edge. Never use a single generic cover letter template for every company; instead, customize the opening and key details to match the employer's exact needs.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            By pairing an impeccably formatted, ATS-compliant resume with a compelling, narrative-driven cover letter, you present a complete and professional profile. Leverage Vireza's advanced career tools to streamline this process, optimize your keywords, and land your dream interviews faster.
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
                    <div>Vireza Editor</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Published</div>
                    <div>28-08-26</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Last Updated</div>
                    <div>02-09-2026</div>
                </div>
            </div>

        </div>
    );
}

export default BLOG1;