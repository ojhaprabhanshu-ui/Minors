import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import './index.css'; 
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";
import Homepage from "./landing_page/home/Homepage";
import ResumeATSpage from "./landing_page/resume/ResumeATS/ResumeATSpage";
// import "./landing_page/css/App.css";     
import Signup from "./landing_page/signup/Signup";
import Login from "./landing_page/login/login_page";
import ResumeBuildPage from "./landing_page/resume/ResumeBuilder/ResumeBuildpage";
import RTPAGE from "./landing_page/resume/ResumeTemplate/RTPAGE";
import CVpage from "./landing_page/CV/CVpage";
import CTpage from "./landing_page/CV/CTpage";
import AIPage from "./landing_page/AI_interview/AIPAGE1";
import OAMainContainer from "./landing_page/OA/OAMainContainer";
import TechnicalInterviewContainer from "./landing_page/technical_interview/TechnicalInterviewContainer";
import HRInterviewContainer from "./landing_page/hr_interview/HRInterviewContainer";
import FullInterviewContainer from "./landing_page/full_interview/FullInterviewContainer";
import BlogPage from "./landing_page/Blog/Blogpage";
import ResumeWorkspace from "./landing_page/resume/ResumeBuilder/ResumeWorkspace";
import { ResumeProvider } from "./landing_page/resume/ResumeBuilder/ResumeContext";

function App() {
  const location = useLocation();
  const hideLayout = ["/signup", "/login", "/oa", "/technical-interview", "/hr-interview", "/full-interview"].includes(location.pathname);

  return (
    <div className="app-container">
      {!hideLayout && <Navbar />}

      <main className="main-content">
        <ResumeProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/resumeATS" element={<ResumeATSpage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/resume/builder" element={<ResumeBuildPage/>}/>
            <Route path="/resume/templates" element={<RTPAGE/>}/>
            <Route path="/cv/builder" element={<CVpage/>}/>
            <Route path="/cv/templates" element={<CTpage/>}/>
            <Route path="/AiInterviewcoach" element={<AIPage/>}/>
            <Route path="/oa" element={<OAMainContainer/>}/>
            <Route path="/technical-interview" element={<TechnicalInterviewContainer/>}/>
            <Route path="/hr-interview" element={<HRInterviewContainer/>}/>
            <Route path="/full-interview" element={<FullInterviewContainer/>}/>
            <Route path="/blog" element={<BlogPage/>}/>
            <Route path="/resume/builder/resumeform" element={<ResumeWorkspace/>}/>
            <Route path="/resume/builder/workspace" element={<ResumeWorkspace/>}/>
          </Routes>
        </ResumeProvider>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
