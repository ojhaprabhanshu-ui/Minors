import React from 'react';
import logoImage from "../Images/logo.webp";

export default function Logo() {
  return (
    <a href="/" className="navbar-logo">
      <img 
        src={logoImage} 
        alt="Vireza" 
        style={{ height: "48px", width: "auto", objectFit: "contain" }} 
      />
    </a>
  );
}