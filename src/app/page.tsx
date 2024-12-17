'use client';
/* eslint-disable */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import WorldMapForHome from '@/components/WorldMapsForHome/WorldMapForHome';
import './HomePage.css';
import './Logo_Carousel.css'; // Import the new CSS for the carousel
import LiveCounters from '@/components/LiveCounter/LiveCounters';
import PopulationPyramidForHome from '@/components/PopulationPyramidForHome/PopulationPyramidForHome';
import LogoCarousel from '@/components/LogoCarousel/LogoCarousel';
import NewsletterModal from '@/components/Modals/NewsletterModal';

// // Import our logo images here
// import logo1 from '../assets/2560px-Business_Insider_Logo.svg.png';
// import logo2 from '../assets/2560px-The_Atlantic_magazine_logo.svg.png';
// import logo3 from '../assets/Boston_Consulting_Group_2020_logo.svg.png';
// import logo4 from '../assets/BuzzFeed-logo.png';
// import logo5 from '../assets/c5920c4f2d71863a7c6a973f6b5c4633.png';
// import logo6 from '../assets/Digg-new.svg.png';
// import logo7 from '../assets/Untitled design (1).png';
// import logo8 from '../assets/Untitled design.png';
// import logo9 from '../assets/vc-logo-black-colour-01.webp';
// import featureImage from '../assets/SpLogoLong.png';

// import awardIcon from '../assets/Award.png';
// import countersIcon from '../assets/Counters.png';
// import countryFlagsIcon from '../assets/CountryFlags.png';
// import earthquakeIcon from '../assets/PopulationCity.png';
// import globeIcon from '../assets/Globe.png';
// import govBuildingIcon from '../assets/GovBuilding.png';
// import instagramLogo from '../assets/Instagram Logo.png';
// import likesCommentsIcon from '../assets/LikesComments.png';
// import redditLogo from '../assets/Reddit.png';
// import usFlag from '../assets/UsFlag.png';
// import webGlobeIcon from '../assets/WebGlobe.png';
// import search from '../assets/search.png';

// Import the search data from the same directory
import searchData from '@/jsonFiles/searchData.json';
import ParticleBackground from '@/components/ParticleBackground';

function Home() {
  console.log('Rendering HomePage');

  // State for search query and filtered results
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  // Fisher-Yates Shuffle function to randomize the array
  const shuffleArray = (array: any) => {
    const shuffledArray = array.slice(); // Create a copy to avoid mutating original data
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  // Shuffle search data once when the component mounts
  useEffect(() => {
    setFilteredResults(shuffleArray(searchData).slice(0, 7)); // Limit initial display to 7 items
  }, []);

  // Handle search input changes
  const handleSearch = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);

    const results = searchData.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()),
    );

    // Limit the results to a maximum of 7
    setFilteredResults(shuffleArray(results).slice(0, 7));
  };

  const handleNewsletterClick = () => {
    setIsNewsletterOpen(true);
  };

  return (
    <div className="home-container">
      <ParticleBackground />
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          Your <span className="orange">Hub</span>
          <br />
          <span className="highlight">For The World&apos;s Data</span>
        </h1>
        <p className="hero-subtitle">
          Browse up-to-date data on countries, U.S. States, Live
          <br />
          Counters, Data Reports, and much more
        </p>
      </div>

      {/* Main Buttons */}
      <div className="button-container">
        <Link href="/UsStates" className="main-button">
          U.S. States Topics
        </Link>
        <Link href="/Countries" className="main-button">
          Country Topics
        </Link>
      </div>

      {/* Call to Action Button */}
      <Link href="/LiveCounters" className="cta-button">
        View All Of Our Live Counters
      </Link>

      {/* Search Section */}
      <div className="search-bar-wrapper">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for statistics..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
          <img
            src="/assets/search.png"
            width={30}
            height={30}
            alt="Search Icon"
            className="search-bar-icon"
          />
        </div>
        <p className="search-bar-caption">
          <span className="search-bar-underline">
            {searchData.length} Data Topics
          </span>{' '}
          - All free, reliable, and updated for 2024
        </p>
      </div>

      {/* Search Results Grid */}
      <div className="search-results-grid">
        {filteredResults.length > 0 ? (
          filteredResults.map((item: any, index: any) => (
            <Link
              key={index}
              href={`${item?.link?.split('/').slice(0, -1).join('/')}/${item?.title?.replace(/ /g, '%20')}`}
              className={`result-item ${item?.linkType}`}
            >
              {item?.linkType === 'CountryDataTopic' && (
                <>Country Data Topic -&nbsp;</>
              )}
              {item?.linkType === 'StateDataTopic' && (
                <>U.S. State Data Topic -&nbsp;</>
              )}
              {item?.linkType === 'CountryName' && <>Country -&nbsp;</>}
              {item?.linkType === 'UsStateName' && <>U.S. State -&nbsp;</>}
              <span style={{ fontSize: '0.875rem' }}>{item?.title}</span>
            </Link>
          ))
        ) : (
          <p className="no-results">No results found.</p>
        )}
      </div>

      {/* View All Data Topics Button */}
      <Link href="/entity/EachState" className="view-all-button">
        View All U.S. States
      </Link>

      {/* Trusted By Section with Carousel */}
      <section className="trusted-by-section">
        <p>Companies of all sizes use the data and stories from StatsPanda</p>
        <LogoCarousel /> {/* Use the LogoCarousel component */}
      </section>

      {/* About Us Section */}
      <section className="about-us-section">
        <h2>
          <span className="orange">StatsPanda</span> is trusted by over 54,000+
          across the globe
        </h2>
        <div className="feature-grid">
          <div className="feature-item">
            <img src="/assets/Instagram Logo.png" alt="Instagram Logo" />
            <h3>Top 1% Instagram Engagement</h3>
          </div>
          <div className="feature-item">
            <img src="/assets/WebGlobe.png" alt="Web Globe Icon" />
            <h3>150,000,000+ annual impressions</h3>
          </div>
          <div className="feature-item">
            <img
              src="/assets/LikesComments.png"
              alt="Likes and Comments Icon"
            />
            <h3>500,000+ annual post engagements</h3>
          </div>
          <div className="feature-item">
            <img src="/assets/Reddit.png" alt="Reddit Logo" />
            <h3>Top 5 Education Media Brand on Reddit</h3>
          </div>
        </div>
        <div className="feature-item-center">
          <img src="/assets/Award.png" alt="Award Icon" />
          <h3>The #1 Rated Free Education Media Brand On The Internet</h3>
        </div>
      </section>

      {/* Explore Pages Section */}
      <section className="explore-pages-section">
        <h2>
          Explore Our <span className="orange">Most Popular</span> Pages
        </h2>
        <p>
          Over 1 million data points across over 500 topics both in the United
          States and across the globe, up-to-date, and always relevant.
        </p>
        <div className="page-grid">
          {[
            {
              image: '/assets/CountryFlags.png',
              title: 'Country Pages',
              description:
                'View all population data related to any specific country in the world.',
              link: '/entity/EachCountry',
            },
            {
              image: '/assets/GovBuilding.png',
              title: 'U.S. State Pages',
              description:
                'View all population data related to any specific U.S. State in the country.',
              link: '/entity/EachState',
            },
            {
              image: '/assets/PopulationCity.png',
              title: 'World Population Data',
              description:
                'Up-to-date information on population ratios and more',
              link: '/LiveCounters',
            },
            {
              image: '/assets/Counters.png',
              title: 'Live Counters',
              description: 'Real-time statistics on various topics',
              link: '/LiveCounters',
            },
            {
              image: '/assets/UsFlag.png',
              title: 'U.S. Data Topics',
              description:
                'Over 250 categories and topics around politics, finance, government, and more',
              link: '/UsStates',
            },
            {
              image: '/assets/Globe.png',
              title: 'Country Data Topics',
              description:
                'Over 260 categories and topics around politics, finance, government, and more',
              link: '/Countries',
            },
          ].map((item, index) => (
            <Link href={item.link} key={index} className="page-item">
              <div className="page-image-container">
                <img src={item.image} alt={item.title} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Counters Section */}
      <section className="live-counters-section flex justify-center py-8">
        <LiveCounters />
      </section>

      {/* Country Data Section */}
      <section className="country-data-section">
        <Link href="/Countries">
          <h2 className="country-data-title">Country Population</h2>
        </Link>
        <WorldMapForHome />
      </section>

      {/* Population Pyramid Section */}
      <section className="population-pyramid-section">
        <h2>Population Pyramid</h2>
        <PopulationPyramidForHome />
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2 className="red-highlight">Show Simply</h2>
        <p>Join 54,000+ others in our 5-minute weekly newsletter</p>
        <div className="cta-buttons">
          <button
            className="cta-button subscribe"
            onClick={handleNewsletterClick}
          >
            Subscribe
          </button>
          <a
            href="https://www.youtube.com/@StatsPanda"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button youtube"
          >
            Visit our YouTube
          </a>
        </div>
      </section>

      {/* Newsletter Modal */}
      <NewsletterModal
        isOpen={isNewsletterOpen}
        setIsOpen={setIsNewsletterOpen}
      />
    </div>
  );
}

export default Home;
