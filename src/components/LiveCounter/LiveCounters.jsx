import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import './LiveCounters.css';

const formatNumber = (number) => {
  return number !== undefined && number !== null
    ? number.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '0';
};

const LiveCounters = () => {
  const [activeTab, setActiveTab] = useState('liveCounters');
  const router = useRouter();

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab === 'liveCounters') {
      if (activeTab === 'liveCounters') {
        router.push('/LiveCounters');
      } else {
        setActiveTab('liveCounters');
      }
    } else {
      setActiveTab(tab);
    }
  };

  // Counters Information
  const countersInfo = [
    // World Population Quadrant
    {
      key: 'currentWorldPopulation',
      label: 'Current world population',
      baseValue: 8000000000,
      perSecondRate: 2.5, // Net population growth per second
      calculation: 'year',
    },
    {
      key: 'birthsThisYear',
      label: 'Births this year',
      perSecondRate: 4.3,
      calculation: 'year',
    },
    {
      key: 'birthsToday',
      label: 'Births today',
      perSecondRate: 4.3,
      calculation: 'day',
    },

    // Health Quadrant
    {
      key: 'diseaseDeathsThisYear',
      label: 'Disease deaths this year',
      perSecondRate: 0.25, // Approximate deaths per second
      calculation: 'year',
    },
    {
      key: 'seasonalFluDeaths',
      label: 'Seasonal flu deaths',
      perSecondRate: 0.001, // Approximate deaths per second
      calculation: 'year',
    },
    {
      key: 'abortionsThisYear',
      label: 'Abortions this year',
      perSecondRate: 1, // Approximate abortions per second
      calculation: 'year',
    },

    // Government & Politics Quadrant
    {
      key: 'healthcareExpenditure',
      label: 'Healthcare expenditure',
      perSecondRate: 263452, // USD per second
      calculation: 'day',
      isCurrency: true,
    },
    {
      key: 'educationExpenditure',
      label: 'Education expenditure',
      perSecondRate: 149099,
      calculation: 'day',
      isCurrency: true,
    },
    {
      key: 'militaryExpenditure',
      label: 'Military expenditure',
      perSecondRate: 63419,
      calculation: 'day',
      isCurrency: true,
    },

    // Energy Quadrant
    {
      key: 'energyUsedToday',
      label: 'Energy used today (MWh)',
      perSecondRate: 5408.3, // MWh per second
      calculation: 'day',
    },
    {
      key: 'nonRenewableEnergy',
      label: 'Non-renewable (MWh)',
      perSecondRate: 4605.99, // MWh per second
      calculation: 'day',
    },
    {
      key: 'renewableEnergy',
      label: 'Renewable (MWh)',
      perSecondRate: 814.62, // MWh per second
      calculation: 'day',
    },
  ];

  // Initialize counters with default values
  const initialCounters = countersInfo.reduce((acc, counter) => {
    acc[counter.key] = counter.baseValue || 0;
    return acc;
  }, {});

  const [counters, setCounters] = useState(initialCounters);

  useEffect(() => {
    if (activeTab !== 'liveCounters') return;

    const updateCounters = () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const secondsThisYear = (now - startOfYear) / 1000;
      const secondsToday = (now - startOfDay) / 1000;

      const newCounters = {};

      countersInfo.forEach((counter) => {
        let value = 0;
        if (counter.calculation === 'year') {
          if (counter.baseValue !== undefined) {
            value = counter.baseValue + counter.perSecondRate * secondsThisYear;
          } else {
            value = counter.perSecondRate * secondsThisYear;
          }
        } else if (counter.calculation === 'day') {
          value = counter.perSecondRate * secondsToday;
        } else if (counter.calculation === 'instant') {
          value = counter.baseValue;
        }
        // Prevent negative values
        newCounters[counter.key] = value < 0 ? 0 : value;
      });

      setCounters(newCounters);
    };

    updateCounters(); // Initial call
    const intervalId = setInterval(updateCounters, 1000);
    return () => clearInterval(intervalId);
  }, [activeTab, countersInfo]);

  // Quadrant Data
  const quadrants = [
    {
      title: 'WORLD POPULATION',
      counters: ['currentWorldPopulation', 'birthsThisYear', 'birthsToday'],
    },
    {
      title: 'HEALTH',
      counters: [
        'diseaseDeathsThisYear',
        'seasonalFluDeaths',
        'abortionsThisYear',
      ],
    },
    {
      title: 'GOVERNMENT & POLITICS',
      counters: [
        'healthcareExpenditure',
        'educationExpenditure',
        'militaryExpenditure',
      ],
    },
    {
      title: 'ENERGY',
      counters: ['energyUsedToday', 'nonRenewableEnergy', 'renewableEnergy'],
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold text-center mb-8">Live Counters</h2>

      <div className="live-counter-container">
        <div className="mini-live-nav">
          <span className="nav-title">Trending Live Counters</span>
          <div className="nav-buttons">
            <button
              className={`nav-button ${activeTab === 'liveCounters' ? 'active' : ''}`}
              onClick={() => handleTabChange('liveCounters')}
            >
              See all Live Counters
            </button>
            <button
              className={`nav-button ${activeTab === 'citations' ? 'active' : ''}`}
              onClick={() => handleTabChange('citations')}
            >
              APA Citations
            </button>
            <button
              className={`nav-button ${activeTab === 'sources' ? 'active' : ''}`}
              onClick={() => handleTabChange('sources')}
            >
              Sources
            </button>
          </div>
        </div>

        {activeTab === 'liveCounters' && (
          <div className="counter-content-container">
            {quadrants.map((quadrant, qIndex) => (
              <div key={qIndex} className="quadrant-container">
                <div className="quadrant-title">
                  <span>{quadrant.title}</span>
                </div>
                <div className="holds-counter-data">
                  {quadrant.counters.map((counterKey, index) => {
                    const counterInfo = countersInfo.find(
                      (c) => c.key === counterKey,
                    );
                    const value = counters[counterKey];
                    const displayValue = counterInfo?.isCurrency
                      ? `$${formatNumber(value)}`
                      : formatNumber(value);

                    return (
                      <div key={index} className="counter-field-live-data">
                        <span className="field-label">
                          {counterInfo?.label}
                        </span>
                        <span className="field-value">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'citations' && (
          <div className="message-container">
            <h2>This feature is on its way!</h2>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="message-container">
            <p>
              This data is collected from various sources including the best
              estimates from the{' '}
              <a
                href="https://www.un.org/en/global-issues/population"
                target="_blank"
                rel="noopener noreferrer"
              >
                United Nations
              </a>
              ,{' '}
              <a
                href="https://www.census.gov/"
                target="_blank"
                rel="noopener noreferrer"
              >
                US Census Bureau
              </a>
              , and hours of data collection by the StatsPanda team.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveCounters;
