// Footer.jsx
import React from 'react';
import Link from 'next/link';
import './Footer.css';

function Footer({ topics = [] }) {
  const formatLinkName = (id, category) => {
    let name = id;
    const path = `/${category}/${encodeURIComponent(id)}`;

    // Apply the transformations according to your requirements

    // Replace 'EachState' with 'U.S. States'
    if (name === 'EachState') {
      name = 'U.S. States';
    }
    // Replace 'EachCountry' with 'Countries'
    else if (name === 'EachCountry') {
      name = 'Countries';
    }
    // Replace 'LiveCounters' with 'Live Counters'
    else if (name === 'LiveCounters') {
      name = 'Live Counters';
    }
    // Replace 'UsStates' with 'U.S. State Topics'
    else if (name === 'UsStates') {
      name = 'U.S. State Topics';
    }
    // Replace 'Countries' with 'Country Data Topics' if path starts with '/Countries'
    else if (name === 'Countries') {
      if (path.startsWith('/Countries')) {
        name = 'Country Data Topics';
      }
    }

    // Remove any instance of 'entity' in the name
    name = name.replace(/entity/gi, '');

    // Trim any extra whitespace
    name = name.trim();

    return name;
  };

  return (
    <footer className="footer">
      <ul>
        {topics.map((topic, index) => {
          const id = typeof topic === 'object' ? topic.id : topic;
          const category = typeof topic === 'object' ? topic.category : '';

          // Adjusted linkPath construction to handle EachState and EachCountry
          let linkPath;
          if (id === 'EachState' || id === 'EachCountry') {
            linkPath = `/entity/${encodeURIComponent(id)}`;
          } else if (!category || category === id) {
            linkPath = `/${encodeURIComponent(id)}`;
          } else {
            linkPath = `/${category}/${encodeURIComponent(id)}`;
          }

          const linkText = formatLinkName(id, category);

          return (
            <li key={id || index}>
              <Link href={linkPath}>{linkText}</Link>
            </li>
          );
        })}
      </ul>
      <div className="footer-bottom">
        <p>&copy; 2024 StatsPanda LLC. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
