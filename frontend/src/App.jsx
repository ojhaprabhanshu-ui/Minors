import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";
import Homepage from "./landing_page/home/Homepage";
import ResumeATSpage from "./landing_page/resume/ResumeATSpage";
import "./landing_page/css/App.css";
import Signup from "./landing_page/signup/Signup";
import Login from "./landing_page/login/login_page";

function App() {
  const location = useLocation();
  const hideLayout = ["/signup", "/login"].includes(location.pathname);

  return (
    <div className="app-container">
      {!hideLayout && <Navbar />}
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/resumeATS" element={<ResumeATSpage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;