import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BlogImg4 from "../../resources/images/BLOGIMG4.webp";

function BLOG4() {
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
                            15 min read
                        </span>
                    </div>

                    <h1 style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "20px", color: "#111827" }}>
                        Best ChatGPT Resume Prompts to Land More Interviews
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
                        src={BlogImg4} 
                        alt="Best ChatGPT Resume Prompts" 
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
                        <button onClick={() => scrollToSection("intro")} className="toc-link">1. Introduction: Leveraging AI for Your Job Search</button>
                        <button onClick={() => scrollToSection("why-use-chatgpt")} className="toc-link">2. Why Use ChatGPT for Resume Building?</button>
                        <button onClick={() => scrollToSection("keyword-optimization")} className="toc-link">3. Prompt 1: ATS Keyword Optimization</button>
                        <button onClick={() => scrollToSection("bullet-point-enhancement")} className="toc-link">4. Prompt 2: Bullet Point Impact Enhancement</button>
                        <button onClick={() => scrollToSection("professional-summary")} className="toc-link">5. Prompt 3: Crafting a High-Impact Summary</button>
                        <button onClick={() => scrollToSection("skills-section")} className="toc-link">6. Prompt 4: Structuring the Skills Section</button>
                        <button onClick={() => scrollToSection("tailoring-to-job")} className="toc-link">7. Prompt 5: Tailoring Resume to Job Description</button>
                        <button onClick={() => scrollToSection("best-practices")} className="toc-link">8. Best Practices When Using AI Prompts</button>
                        <button onClick={() => scrollToSection("conclusion")} className="toc-link">9. Conclusion & Next Steps with Vireza</button>
                    </div>
                </div>

                {/* Right Side: Deeply Detailed Article Content */}
                <div style={{ flex: "1", minWidth: "300px", lineHeight: "1.8", color: "#374151", fontSize: "1.05rem", display: "flex", flexDirection: "column", gap: "55px" }}>
                    
                    <section id="intro">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>1. Introduction: Leveraging AI for Your Job Search</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Artificial Intelligence has revolutionized how professionals approach the job hunt. Among the most powerful tools available today is ChatGPT, which can act as your personal career coach, copywriter, and resume consultant. However, simply asking ChatGPT to "write a resume" usually yields generic results. The secret to unlocking interview-winning output lies in using precise, structured prompts.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            In this comprehensive guide, we will break down the best ChatGPT prompts specifically engineered to optimize your resume, beat automated tracking systems, and highlight your quantifiable achievements effectively.
                        </p>
                    </section>

                    <section id="why-use-chatgpt">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>2. Why Use ChatGPT for Resume Building?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Crafting a professional resume can be mentally exhausting and time-consuming. ChatGPT helps eliminate writer's block by quickly synthesizing your raw experience into polished, impactful professional phrasing. It allows you to rapidly iterate on different versions of your resume tailored to varied industries without starting from scratch every single time.
                        </p>
                    </section>

                    <section id="keyword-optimization">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>3. Prompt 1: ATS Keyword Optimization</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Applicant Tracking Systems (ATS) scan resumes for specific keywords before a human ever reviews them. Use this prompt to ensure your resume matches target job postings:
                        </p>
                        <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB", fontStyle: "italic", marginBottom: "16px" }}>
                            "Act as an expert ATS resume optimizer. Here is my current resume: [Insert Resume] and here is the target job description: [Insert Job Description]. Analyze both and provide a list of missing critical hard skills and keywords that I should incorporate to pass automated screening."
                        </div>
                    </section>

                    <section id="bullet-point-enhancement">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>4. Prompt 2: Bullet Point Impact Enhancement</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Weak bullet points lack action and metrics. Transform your daily responsibilities into compelling achievement statements with this prompt:
                        </p>
                        <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB", fontStyle: "italic", marginBottom: "16px" }}>
                            "Act as an executive resume writer. Rewrite the following work experience bullet points using action verbs, metrics, and the Google XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]): [Insert Bullet Points]."
                        </div>
                    </section>

                    <section id="professional-summary">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>5. Prompt 3: Crafting a High-Impact Summary</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Your professional summary is your elevator pitch. Make it punchy and memorable:
                        </p>
                        <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB", fontStyle: "italic", marginBottom: "16px" }}>
                            "Write 3 distinct options for a professional resume summary for a [Insert Job Title] with [Number] years of experience specializing in [Insert Core Skill]. Keep each option under 4 sentences and tailor them to catch a recruiter's attention immediately."
                        </div>
                    </section>

                    <section id="skills-section">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>6. Prompt 4: Structuring the Skills Section</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Organize your hard and soft skills logically so hiring managers can review your competencies at a glance:
                        </p>
                        <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB", fontStyle: "italic", marginBottom: "16px" }}>
                            "Based on the following job description: [Insert Job Description], categorize and list the essential technical and soft skills into clean subsections that I can easily insert into my resume."
                        </div>
                    </section>

                    <section id="tailoring-to-job">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>7. Prompt 5: Tailoring Resume to Job Description</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Customize your entire profile seamlessly for specific roles using this prompt:
                        </p>
                        <div style={{ backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "8px", border: "1px solid #E5E7EB", fontStyle: "italic", marginBottom: "16px" }}>
                            "Review my resume details below and adjust the phrasing to emphasize my relevant experience for a [Insert Job Title] position at [Company Name]. Make sure my alignment with their core values shines through: [Insert Resume Data]."
                        </div>
                    </section>

                    <section id="best-practices">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>8. Best Practices When Using AI Prompts</h2>
                        <p style={{ marginBottom: "16px" }}>
                            While AI is a powerful assistant, never blindly copy and paste its output. Always review the generated text for accuracy, verify that the metrics reflect your true experience, and ensure your personal voice remains intact. AI should augment your writing process, not replace your unique professional identity.
                        </p>
                    </section>

                    <section id="conclusion">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>9. Conclusion & Next Steps with Vireza</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Combining ChatGPT's optimization capabilities with Vireza's powerful resume builder tools gives you an unstoppable advantage in today's competitive job market. Start refining your prompts, polish your resume, and land more interviews today!
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
                    <div>August 26, 2026</div>
                </div>
            </div>

        </div>
    );
}

export default BLOG4;