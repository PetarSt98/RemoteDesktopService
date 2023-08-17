import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <div className="footer">
      <p>
        Copyright © 2023 CERN |
        <a 
          href="https://cern.service-now.com/service-portal?id=service_element&name=windows-terminal" 
          className="contact-link"
        >
          Contact for Support
        </a>
      </p>
    </div>
  );
}

export default Footer;
