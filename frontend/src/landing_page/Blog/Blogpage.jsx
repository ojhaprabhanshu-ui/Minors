import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlogImg1 from "../../resources/images/BLOGIMG1.webp";
import BlogImg2 from "../../resources/images/BLOGIMG2.webp";
import BlogImg3 from "../../resources/images/BLOGIMG3.webp";
import BlogImg4 from "../../resources/images/BLOGIMG4.webp";
import BlogImg5 from "../../resources/images/BLOGIMG5.webp";

function BlogPage() {
    const navigate = useNavigate();

    const blogCards = [
        {
            id: "resume-vs-cover-letter",
            image: BlogImg1,
            readTime: "11 min read",
            title: "Resume vs Cover Letter: What's the Difference and Why It Matter...",
            description: "Understand the key difference between resume and cover letter. Learn how resume vs cover letter vary in purpose, format, and...",
            author: "Vireza Team",
            role: "Career Advisor"
        },
        {
            id: "international-cv-format",
            image: BlogImg2,
            readTime: "12 min read",
            title: "International CV & Resume Format: Best Practices & Examples...",
            description: "Create a professional international resume with global formatting rules, best practices, and examples. Learn how to make a CV for...",
            author: "Vireza Team",
            role: "Career Development Experts"
        },
        {
            id: "60-soft-skills-for-resumes",
            image: BlogImg3,
            readTime: "15 min read",
            title: "60 Soft Skills for Resumes",
            description: "Discover the best soft skills for resumes, skills for CV, and examples for freshers. Learn how to showcase personal skills in...",
            author: "Vireza Team",
            role: "Career Development Experts"
        },
        {
            id: "best-chatgpt-resume-prompts",
            image: BlogImg4,
            readTime: "15 min read",
            title: "Best ChatGPT Resume Prompts to Land More Interviews",
            description: "Discover the best ChatGPT resume prompts to build ATS-friendly resumes, optimize keywords, and boost your chances of...",
            author: "Vireza Team",
            role: "Career Development Experts"
        },
        {
            id: "ats-ready-resume-builder-2026",
            image: BlogImg5,
            readTime: "12 min read",
            title: "ATS-Ready Resume Builder 2026: Best Practices, Formats & Real...",
            description: "Create a powerful ATS-friendly resume with best practices, formatting tips, and top tools for 2026. Learn how to optimize your...",
            author: "Vireza Team",
            role: "Career Development Experts"
        }
    ];

    return (
        <div className="container" style={{ textAlign: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 20px" }}>
            <style>
                {`
                    .blog-card {
                        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                        transform: translateY(0) scale(1);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    }
                    .blog-card:hover {
                        transform: translateY(-8px) scale(1.02);
                        box-shadow: 0 20px 35px -5px rgba(39, 110, 245, 0.22), 0 10px 15px -5px rgba(0, 0, 0, 0.05);
                        border-color: rgba(39, 110, 245, 0.4) !important;
                    }
                    .blog-image {
                        transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .blog-card:hover .blog-image {
                        transform: scale(1.06);
                    }
                    .blog-title {
                        transition: color 0.3s ease;
                    }
                    .blog-card:hover .blog-title {
                        color: #dc2626 !important;
                    }
                    .read-more-btn {
                        transition: all 0.3s ease;
                    }
                    .blog-card:hover .read-more-btn {
                        background-color: #1d4ed8 !important;
                        box-shadow: 0 4px 12px rgba(39, 110, 245, 0.4);
                        transform: translateY(-1px);
                    }
                `}
            </style>

            <h2 style={{ fontSize: "3rem", fontWeight: "700", color: "#111827" }}>
                Vireza <span style={{ color: "#276EF5" }}>Blog</span>
            </h2>
            <p style={{ color: "#4B5563", fontSize: "1rem", marginTop: "8px", marginBottom: "40px" }}>
                Expert insights, career tips, and the latest updates on resume building and job searching.
            </p>

            <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap" }}>
                {blogCards.map((blog) => (
                    <div 
                        key={blog.id} 
                        className="blog-card"
                        onClick={() => navigate(`/blog/${blog.id}`)}
                        style={{
                            width: "350px",
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            overflow: "hidden",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            border: "1px solid #f3f4f6",
                            cursor: "pointer"
                        }}
                    >
                        <div style={{ position: "relative", width: "100%", height: "200px", overflow: "hidden" }}>
                            <img 
                                src={blog.image} 
                                alt={blog.title} 
                                className="blog-image"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                            />
                            <span style={{
                                position: "absolute",
                                top: "12px",
                                left: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                backdropFilter: "blur(4px)",
                                padding: "4px 10px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                borderRadius: "6px",
                                color: "#374151",
                                zIndex: 2
                            }}>
                                {blog.readTime}
                            </span>
                        </div>

                        <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                            <h3 
                                className="blog-title"
                                style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", lineHeight: "1.4", marginBottom: "10px" }}
                            >
                                {blog.title}
                            </h3>
                            <p style={{ fontSize: "0.875rem", color: "#6B7280", lineHeight: "1.5", marginBottom: "20px" }}>
                                {blog.description}
                            </p>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "32px",
                                        height: "32px",
                                        backgroundColor: "#FFEDD5",
                                        color: "#C2410C",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        fontWeight: "700"
                                    }}>
                                        VT
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#111827" }}>{blog.author}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{blog.role}</div>
                                    </div>
                                </div>
                                <button 
                                    className="read-more-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/blog/${blog.id}`);
                                    }}
                                    style={{
                                        backgroundColor: "#276EF5",
                                        color: "#ffffff",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        cursor: "pointer"
                                    }}
                                >
                                    Read more
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BlogPage;