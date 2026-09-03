import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BlogImg3 from "../../resources/images/BLOGIMG3.webp";

function BLOG3() {
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
                        60 Soft Skills for Resumes
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
                        src={BlogImg3} 
                        alt="60 Soft Skills for Resumes" 
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
                        <button onClick={() => scrollToSection("what-are-soft-skills")} className="toc-link">1. What Are Soft Skills?</button>
                        <button onClick={() => scrollToSection("why-employers-value")} className="toc-link">2. Why Do Employers Value Soft Skills?</button>
                        <button onClick={() => scrollToSection("soft-vs-hard-skills")} className="toc-link">3. Soft Skills vs Hard Skills</button>
                        <button onClick={() => scrollToSection("why-on-every-resume")} className="toc-link">4. Why Should Soft Skills Be on Every Resume?</button>
                        <button onClick={() => scrollToSection("what-soft-skills-to-put")} className="toc-link">5. What Soft Skills Should I Put on My Resume?</button>
                        <button onClick={() => scrollToSection("ultimate-soft-skills-list")} className="toc-link">6. The Ultimate Soft Skills List for Resumes</button>
                        <button onClick={() => scrollToSection("how-to-add-soft-skills")} className="toc-link">7. How to Add Soft Skills in a Resume?</button>
                        <button onClick={() => scrollToSection("soft-skills-for-freshers")} className="toc-link">8. Soft Skills in Resume for Freshers</button>
                        <button onClick={() => scrollToSection("cv-vs-resume-skills")} className="toc-link">9. Skills for CV vs Skills for Resume: What's the Difference?</button>
                        <button onClick={() => scrollToSection("how-to-make-credible")} className="toc-link">10. How to Make Your Soft Skills More Credible?</button>
                        <button onClick={() => scrollToSection("sample-skills-sections")} className="toc-link">11. Sample Skills Sections (Professionals + Freshers)</button>
                        <button onClick={() => scrollToSection("different-groups")} className="toc-link">12. Different Groups of Soft Skills</button>
                        <button onClick={() => scrollToSection("what-are-the-soft-skills")} className="toc-link">13. What Are the Soft Skills in a Resume?</button>
                        <button onClick={() => scrollToSection("mistakes-to-avoid")}  className="toc-link">14. Mistakes to Avoid When Adding Soft Skills</button>
                        <button onClick={() => scrollToSection("increase-hiring-success")} className="toc-link">15. Why Soft Skills Increase Your Hiring Success?</button>
                        <button onClick={() => scrollToSection("conclusion")} className="toc-link">16. Key Takeaways & Conclusion</button>
                    </div>
                </div>

                {/* Right Side: Deeply Detailed Article Content */}
                <div style={{ flex: "1", minWidth: "300px", lineHeight: "1.8", color: "#374151", fontSize: "1.05rem", display: "flex", flexDirection: "column", gap: "55px" }}>
                    
                    <section id="what-are-soft-skills">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>1. What Are Soft Skills?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Soft skills represent the cluster of personal attributes, interpersonal communication capabilities, cognitive tendencies, and emotional intelligence traits that dictate how effectively an individual operates within a professional environment. Unlike technical proficiencies—which measure your precise command over specific software, machinery, or coding languages—soft skills measure your fundamental character, relational approach, and behavior under varying degrees of workplace pressure.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            These competencies cannot always be measured through rigid certification tests or quantified algorithms. Instead, they manifest in your everyday interactions: how you deliver constructive criticism, how you manage conflict during high-stakes project delays, how you handle unpredictable feedback from leadership, and how empathetically you guide a junior teammate through a learning curve.
                        </p>
                    </section>

                    <section id="why-employers-value">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>2. Why Do Employers Value Soft Skills?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            In modern corporate ecosystems, technology and tools evolve at breakneck speeds. A technical skill that is revolutionary today might become automated or obsolete within a few years. Consequently, employers have recognized that an applicant's adaptability, resilience, and willingness to learn are far more reliable predictors of long-term career value.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Hiring managers actively prioritize soft skills because toxic or poorly integrated team members can paralyze collective productivity, damage morale, and drive up turnover rates. Conversely, professionals equipped with robust emotional intelligence create psychological safety, streamline communication channels, and inspire cross-functional teams to exceed organizational targets.
                        </p>
                    </section>

                    <section id="soft-vs-hard-skills">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>3. Soft Skills vs Hard Skills</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Understanding the distinction between hard and soft skills is critical for designing a well-balanced resume. Hard skills are teachable, job-specific technical abilities—such as data querying using SQL, financial modeling, proficiency in Adobe Creative Suite, or mechanical engineering design. They answer the question: <em>"What technical tools can you operate?"</em>
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Soft skills, on the other hand, answer the question: <em>"How do you execute your work and collaborate with others?"</em> They include active listening, negotiation, patience, time management, and ethical decision-making. While hard skills secure your resume's passage through initial screening algorithms, your soft skills ultimately win over the hiring panel during face-to-face or video interviews.
                        </p>
                    </section>

                    <section id="why-on-every-resume">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>4. Why Should Soft Skills Be on Every Resume?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Many job seekers mistakenly crowd their resumes entirely with technical jargon, assuming that programming languages or software titles are all recruiters care about. However, operating in isolation is rare in contemporary workspaces. Every position—from software engineering and marketing to customer operations and executive leadership—requires continuous collaboration.
                        </p>
                        <p style={{ marginBottom: "16px" }}>
                            Embedding strategic soft skills demonstrates that you are not just a technical executor, but a holistic professional who can manage client relations, mentor colleagues, take ownership of mistakes, and champion organizational culture effectively.
                        </p>
                    </section>

                    <section id="what-soft-skills-to-put">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>5. What Soft Skills Should I Put on My Resume?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            You should never list random soft skills just to fill whitespace. The selection must be deliberate and tailored directly to the specific job description you are targeting. Read through the company’s requirements carefully: if the posting emphasizes "fast-paced agile environments," highlight your adaptability and time-management skills. If it mentions "client-facing advisory," prioritize active listening and persuasive communication.
                        </p>
                    </section>

                    <section id="ultimate-soft-skills-list">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>6. The Ultimate Soft Skills List for Resumes</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Here is a comprehensive breakdown of top-tier soft skills categorized by their impact:
                        </p>
                        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <li><strong>Communication:</strong> Active listening, written clarity, verbal articulation, public speaking, negotiation.</li>
                            <li><strong>Teamwork & Collaboration:</strong> Empathy, conflict resolution, cultural awareness, mediation, peer support.</li>
                            <li><strong>Problem-Solving & Critical Thinking:</strong> Analytical reasoning, creativity, troubleshooting, innovation, decision-making.</li>
                            <li><strong>Work Ethic & Reliability:</strong> Accountability, time management, punctuality, dedication, autonomy.</li>
                            <li><strong>Leadership & Management:</strong> Mentorship, delegation, emotional intelligence, strategic vision, motivational coaching.</li>
                        </ul>
                    </section>

                    <section id="how-to-add-soft-skills">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>7. How to Add Soft Skills in a Resume?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Simply listing "Communication" or "Teamwork" as bullet points under a generic skills section carries very little weight because any applicant can type those words. Instead, embed them contextually within your professional summary and your work history bullet points by pairing them with tangible actions and outcomes.
                        </p>
                    </section>

                    <section id="soft-skills-for-freshers">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>8. Soft Skills in Resume for Freshers</h2>
                        <p style={{ marginBottom: "16px" }}>
                            If you are a recent graduate or fresher entering the job market with limited corporate experience, soft skills are your secret weapon. Because you may not yet have years of corporate accomplishments, highlighting your eagerness to learn, quick adaptability, teamwork during university projects, and strong work ethic reassures recruiters that you are coachable and ready to succeed.
                        </p>
                    </section>

                    <section id="cv-vs-resume-skills">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>9. Skills for CV vs Skills for Resume: What's the Difference?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            While resumes demand a highly filtered, laser-focused selection of soft skills customized for a specific commercial posting, comprehensive CVs (commonly used in academic, research, or international sectors) allow for a broader articulation of leadership roles across committees, symposiums, publishing collaborations, and public organizations.
                        </p>
                    </section>

                    <section id="how-to-make-credible">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>10. How to Make Your Soft Skills More Credible?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Credibility is established through context and proof. Transform vague assertions into compelling achievements. For example, instead of writing <em>"Good communicator,"</em> write: <em>"Facilitated weekly stakeholder alignment meetings, translating complex technical requirements into actionable roadmaps for 12 cross-functional engineers."</em>
                        </p>
                    </section>

                    <section id="sample-skills-sections">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>11. Sample Skills Sections (Professionals + Freshers)</h2>
                        <p style={{ marginBottom: "16px" }}>
                            <strong>For Experienced Professionals:</strong> Focus on strategic leadership, stakeholder management, conflict mitigation, and cross-functional guidance.<br />
                            <strong>For Freshers:</strong> Focus on rapid skill acquisition, teamwork, time management, active listening, and adaptability.
                        </p>
                    </section>

                    <section id="different-groups">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>12. Different Groups of Soft Skills</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Soft skills can be effectively grouped into interpersonal dynamics (how you relate to humans), personal self-management (how you regulate your habits and stress), and cognitive problem-solving approaches (how you process complex organizational challenges).
                        </p>
                    </section>

                    <section id="what-are-the-soft-skills">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>13. What Are the Soft Skills in a Resume?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Ultimately, soft skills in a resume act as the emotional glue connecting your technical qualifications to the real-world operational success of the company. They prove that you can lead with grace and collaborate seamlessly under pressure.
                        </p>
                    </section>

                    <section id="mistakes-to-avoid">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>14. Mistakes to Avoid When Adding Soft Skills</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Avoid cluttering your resume with dozens of unverified buzzwords, failing to connect your soft skills to actual workplace outcomes, or neglecting the specific keyword phrases mentioned in the employer's job description.
                        </p>
                    </section>

                    <section id="increase-hiring-success">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>15. Why Soft Skills Increase Your Hiring Success?</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Candidates who master the articulation of soft skills effortlessly navigate behavioral interview questions, establish immediate rapport with hiring committees, and stand out memorably in competitive applicant pools.
                        </p>
                    </section>

                    <section id="conclusion">
                        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#111827", marginBottom: "16px" }}>16. Key Takeaways & Conclusion</h2>
                        <p style={{ marginBottom: "16px" }}>
                            Balancing hard technical proficiencies with compelling soft skills is the ultimate formula for a winning resume. Utilize Vireza's advanced resume builder tools to structure your professional profile flawlessly and accelerate your path toward your dream career.
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
                    <div>Vireza Team</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Published</div>
                    <div>August 8, 2026</div>
                </div>
                <div>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Last Updated</div>
                    <div>August 16, 2026</div>
                </div>
            </div>

        </div>
    );
}

export default BLOG3;