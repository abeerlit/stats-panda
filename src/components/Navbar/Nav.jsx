// Nav.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import SpLogoLong from '/assets/SpLogoLong.png';
// import SpLogoSmall from '/assets/SpLogoSmall.png';
import NewsletterModal from '@/components/Modals/NewsletterModal';
import MUIMenu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './Nav.css';

function Nav() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    handleClose();
    if (!isDesktop) {
      setIsMenuOpen((prevState) => !prevState);
    }
  };

  const handleNewsletter = () => {
    setIsMenuOpen(false);
    setIsOpen(true);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const openEl = Boolean(anchorEl);
  const handleClick = (event) => {
    if (!anchorEl) {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link href="/" className="logo-link">
          {isDesktop ? (
            <img
              src="/assets/SpLogoLong.png"
              alt="StatsPanda Logo"
              className="logo"
            />
          ) : (
            <img
              src="/assets/SpLogoSmall.png"
              alt="StatsPanda Logo"
              className="logo"
            />
          )}
        </Link>
        {!isDesktop && (
          <button className="hamburger" onClick={toggleMenu}>
            <div className="hamburger-icon">
              {isMenuOpen ? (
                <X size={24} color="#ff6600" />
              ) : (
                <Menu size={24} color="#ff6600" />
              )}
            </div>
          </button>
        )}
      </div>
      {(isMenuOpen || isDesktop) && (
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li>
            <Link href="/LiveCounters" onClick={toggleMenu}>
              Live Counters
            </Link>
            Live Counters
          </li>
          {isDesktop ? (
            <li
              id="basic-button"
              aria-controls={openEl ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openEl ? 'true' : undefined}
              onClick={handleClick}
            >
              <p className="nav-link-style-parent">Data Topics</p>
              <MUIMenu
                id="basic-menu"
                anchorEl={anchorEl}
                open={openEl}
                onClose={handleClose}
              >
                <li className="nav-link-style">
                  <Link href="/UsStates" onClick={toggleMenu}>
                    U.S. States
                  </Link>
                </li>
                <li className="nav-link-style">
                  <Link href="/Countries" onClick={toggleMenu}>
                    Countries
                  </Link>
                </li>
              </MUIMenu>
            </li>
          ) : (
            <>
              <li>
                <Link href="/UsStates" onClick={toggleMenu}>
                  US States Topics
                </Link>
              </li>
              <li>
                <Link href="/Countries" onClick={toggleMenu}>
                  Countries Topics
                </Link>
              </li>
            </>
          )}
          <li>
            <Link href="/entity/EachState" onClick={toggleMenu}>
              US States
            </Link>
          </li>
          <li>
            <Link href="/entity/EachCountry" onClick={toggleMenu}>
              Countries
            </Link>
          </li>
          <button onClick={handleNewsletter} className="newsletter-button">
            Newsletter
          </button>
        </ul>
      )}
      <NewsletterModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </nav>
  );
}

export default Nav;
