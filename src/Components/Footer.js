import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <div className="footer">
      <p>
      <span className="copyright-text">
          Copyright © 2023 CERN 
        </span> <span className="separator">|</span>
        <a 
          href="https://cern.service-now.com/service-portal?id=service_element&name=windows-terminal" 
          className="contact-link"
        >
          Contact for Support
        </a>
        <span className="separator">|</span>        
        <a 
          href="https://cern.service-now.com/service-portal?id=privacy_policy&se=windows-terminal&notice=wts" 
          className="contact-link"
        >
          Privacy Notice
        </a>
      </p>
    </div>
  );
}

export default Footer;
