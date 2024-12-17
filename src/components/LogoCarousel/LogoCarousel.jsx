// LogoCarousel.jsx
import React from 'react';
import './LogoCarousel.css';

// Import the logo images using the exact filenames you've provided

// import logo5 from '/assets/c5920c4f2d71863a7c6a973f6b5c4633.png';
// import logo6 from '/assets/Digg-new.svg.png';
// import logo7 from '/assets/Untitled design (1).png';
// import logo8 from '/assets/Untitled design.png';
// import logo9 from '/assets/vc-logo-black-colour-01.webp';

const LogoCarousel = () => {
  const logos = [
    '/assets/2560px-Business_Insider_Logo.svg.png',
    '/assets/2560px-The_Atlantic_magazine_logo.svg.png',
    '/assets/Boston_Consulting_Group_2020_logo.svg.png',
    '/assets/BuzzFeed-logo.png',
    '/assets/c5920c4f2d71863a7c6a973f6b5c4633.png',
    '/assets/Digg-new.svg.png',
    '/assets/Untitled design (1).png',
    '/assets/Untitled design.png',
    '/assets/vc-logo-black-colour-01.webp',
  ];

  return (
    <div className="logo-carousel">
      <div className="logo-carousel-track">
        {logos.concat(logos).map((logo, index) => (
          <div className="logo-item" key={index}>
            <img
              src={logo}
              alt={`Logo ${index + 1}`}
              className="carousel-logo"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoCarousel;
