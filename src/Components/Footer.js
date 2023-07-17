import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <div className="footer">
      <p>
        Author: Petar Stojkovic |
        <a 
          href="mailto:petar.stojkovic@cern.ch?subject=Remote Desktop Service Support&cc=pablo.martin.zamora@cern.ch" 
          className="contact-link"
        >
          Contact for Support
        </a>
      </p>
    </div>
  );
}

export default Footer;
