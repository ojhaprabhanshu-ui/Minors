import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";
import Homepage from "./landing_page/home/Homepage";
import ResumeATSpage from "./landing_page/resume/ResumeATSpage";
import "./landing_page/css/App.css";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/resumeATS" element={<ResumeATSpage />} />
          <Route path="/blog" element={<ResumeATSpage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;