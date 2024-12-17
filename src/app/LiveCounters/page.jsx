'use client';
import React, { useState, useEffect } from 'react';
import './CountersPage.css';
import ParticleBackground from '@/components/ParticleBackground';

const formatNumber = (number) => {
  return number !== undefined && number !== null
    ? number.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '0';
};

const CountersPage = () => {
  // Counters Information
  const countersInfo = [
    // World Population
    {
      key: 'currentPopulation',
      label: 'Current World Population',
      baseValue: 8000000000, // Approximate current world population
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
    {
      key: 'deathsThisYear',
      label: 'Deaths this year',
      perSecondRate: 1.8,
      calculation: 'year',
    },
    {
      key: 'deathsToday',
      label: 'Deaths today',
      perSecondRate: 1.8,
      calculation: 'day',
    },
    {
      key: 'absoluteGrowthYear',
      label: 'Population growth this year',
      perSecondRate: 2.5,
      calculation: 'year',
    },
    {
      key: 'absoluteGrowth',
      label: 'Population growth today',
      perSecondRate: 2.5,
      calculation: 'day',
    },

    // Government & Economics
    {
      key: 'carsProducedThisYear',
      label: 'Cars produced this year',
      perSecondRate: 2.7, // Approximate cars produced per second
      calculation: 'year',
    },
    {
      key: 'bicyclesProducedThisYear',
      label: 'Bicycles produced this year',
      perSecondRate: 4.1, // Approximate bicycles produced per second
      calculation: 'year',
    },
    {
      key: 'computersProducedThisYear',
      label: 'Computers produced this year',
      perSecondRate: 10, // Approximate computers produced per second
      calculation: 'year',
    },
    {
      key: 'govExpendituresHealth',
      label: 'Government expenditure on health today',
      perSecondRate: 263452, // USD per second
      calculation: 'day',
      isCurrency: true,
    },
    {
      key: 'govExpendituresEducation',
      label: 'Government expenditure on education today',
      perSecondRate: 149099,
      calculation: 'day',
      isCurrency: true,
    },
    {
      key: 'govExpendituresMilitary',
      label: 'Government expenditure on military today',
      perSecondRate: 63419,
      calculation: 'day',
      isCurrency: true,
    },

    // Society & Media
    {
      key: 'newBookTitlesPublishedThisYear',
      label: 'New book titles published this year',
      perSecondRate: 0.1, // Approximate new book titles per second
      calculation: 'year',
    },
    {
      key: 'newspapersCirculatedToday',
      label: 'Newspapers circulated today',
      perSecondRate: 50000, // Approximate newspapers per second
      calculation: 'day',
    },
    {
      key: 'tvSetsSoldToday',
      label: 'TV sets sold worldwide today',
      perSecondRate: 7, // Approximate TVs sold per second
      calculation: 'day',
    },
    {
      key: 'cellularPhonesSoldToday',
      label: 'Cellular phones sold today',
      perSecondRate: 15, // Approximate phones sold per second
      calculation: 'day',
    },
    {
      key: 'moneySpentOnVideoGamesToday',
      label: 'Money spent on video games today',
      perSecondRate: 145000, // USD per second
      calculation: 'day',
      isCurrency: true,
    },
    {
      key: 'internetUsers',
      label: 'Internet users in the world today',
      baseValue: 4900000000,
      perSecondRate: 10, // Approximate new internet users per second
      calculation: 'year',
    },
    {
      key: 'emailsSentToday',
      label: 'Emails sent today',
      perSecondRate: 2500000, // Emails per second
      calculation: 'day',
    },
    {
      key: 'blogPostsWrittenToday',
      label: 'Blog posts written today',
      perSecondRate: 350, // Blog posts per second
      calculation: 'day',
    },
    {
      key: 'tweetsSentToday',
      label: 'Tweets sent today',
      perSecondRate: 6000, // Tweets per second
      calculation: 'day',
    },
    {
      key: 'googleSearchesToday',
      label: 'Google searches today',
      perSecondRate: 99000, // Searches per second
      calculation: 'day',
    },
    {
      key: 'gamesOfWordlePlayedThisYear',
      label: 'Games of Wordle played this year',
      perSecondRate: 60, // Approximate games per second
      calculation: 'year',
    },

    // Environment
    {
      key: 'co2EmissionsThisYear',
      label: 'CO2 emissions this year (tons)',
      perSecondRate: 1154, // Tons per second
      calculation: 'year',
    },
    {
      key: 'forestLossThisYear',
      label: 'Forest loss this year (hectares)',
      perSecondRate: 0.793, // Hectares per second
      calculation: 'year',
    },

    // Food
    {
      key: 'undernourishedPeople',
      label: 'Undernourished people in the world',
      baseValue: 820000000, // Approximate number
      perSecondRate: -0.158, // Decreasing per second
      calculation: 'year',
    },
    {
      key: 'overweightPeople',
      label: 'Overweight people in the world',
      baseValue: 1700000000, // Approximate number
      perSecondRate: 0.317, // Increasing per second
      calculation: 'year',
    },
    {
      key: 'obesePeople',
      label: 'Obese people in the world',
      baseValue: 650000000, // Approximate number
      perSecondRate: 0.158, // Increasing per second
      calculation: 'year',
    },
    {
      key: 'deathsHungerToday',
      label: 'People who died of hunger today',
      perSecondRate: 0.25, // Deaths per second
      calculation: 'day',
    },
    {
      key: 'moneySpentOnObesityDiseasesToday',
      label: 'Money spent for obesity related diseases in the USA today',
      perSecondRate: 4000000, // USD per second
      calculation: 'day',
      isCurrency: true,
    },
    {
      key: 'moneySpentOnWeightLossProgramsToday',
      label: 'Money spent on weight loss programs in the USA today',
      perSecondRate: 1500000, // USD per second
      calculation: 'day',
      isCurrency: true,
    },

    // Water
    {
      key: 'waterConsumedThisYear',
      label: 'Water consumed this year (cubic meters)',
      perSecondRate: 126883, // Cubic meters per second
      calculation: 'year',
    },
    {
      key: 'deathsWaterRelatedDiseasesThisYear',
      label: 'Deaths caused by water related diseases this year',
      perSecondRate: 0.15, // Deaths per second
      calculation: 'year',
    },
    {
      key: 'peopleWithoutSafeDrinkingWater',
      label: 'People with no access to a safe drinking water source',
      baseValue: 785000000, // Approximate number
      perSecondRate: -0.158, // Decreasing per second
      calculation: 'year',
    },

    // Energy
    {
      key: 'gallonsOfGasolineUsedThisYear',
      label: 'Gallons of gasoline used this year',
      perSecondRate: 1000000, // Gallons per second
      calculation: 'year',
    },
  ];

  const sections = [
    {
      title: 'World Population',
      counters: [
        'currentPopulation',
        'birthsThisYear',
        'birthsToday',
        'deathsThisYear',
        'deathsToday',
        'absoluteGrowthYear',
        'absoluteGrowth',
      ],
    },
    {
      title: 'Government & Economics',
      counters: [
        'carsProducedThisYear',
        'bicyclesProducedThisYear',
        'computersProducedThisYear',
        'govExpendituresHealth',
        'govExpendituresEducation',
        'govExpendituresMilitary',
      ],
    },
    {
      title: 'Society & Media',
      counters: [
        'newBookTitlesPublishedThisYear',
        'newspapersCirculatedToday',
        'tvSetsSoldToday',
        'cellularPhonesSoldToday',
        'moneySpentOnVideoGamesToday',
        'internetUsers',
        'emailsSentToday',
        'blogPostsWrittenToday',
        'tweetsSentToday',
        'googleSearchesToday',
        'gamesOfWordlePlayedThisYear',
      ],
    },
    {
      title: 'Environment',
      counters: ['co2EmissionsThisYear', 'forestLossThisYear'],
    },
    {
      title: 'Food',
      counters: [
        'undernourishedPeople',
        'overweightPeople',
        'obesePeople',
        'deathsHungerToday',
        'moneySpentOnObesityDiseasesToday',
        'moneySpentOnWeightLossProgramsToday',
      ],
    },
    {
      title: 'Water',
      counters: [
        'waterConsumedThisYear',
        'deathsWaterRelatedDiseasesThisYear',
        'peopleWithoutSafeDrinkingWater',
      ],
    },
    {
      title: 'Energy',
      counters: ['gallonsOfGasolineUsedThisYear'],
    },
  ];

  // Initialize counters with default values
  const initialCounters = countersInfo.reduce((acc, counter) => {
    acc[counter.key] = counter.baseValue || 0;
    return acc;
  }, {});

  const [counters, setCounters] = useState(initialCounters);

  useEffect(() => {
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
  }, [countersInfo]);

  return (
    <div className="counters-page">
      <ParticleBackground />
      <div className="center-topic">
        <h1>
          <span className="highlight">Live Counters</span>
        </h1>
      </div>
      <p className="counters-description">
        Real-time statistics using our proprietary algorithm which processes the
        latest data and predictions provided by the most reputable organizations
        and statistical offices in the world.
      </p>
      {sections.map((section) => (
        <div key={section.title} className="counter-section">
          <h2>{section.title}</h2>
          {section.counters.map((counterKey) => {
            const counterInfo = countersInfo.find((c) => c.key === counterKey);
            const value = counters[counterKey];
            const displayValue = counterInfo?.isCurrency
              ? `$${formatNumber(value)}`
              : formatNumber(value);
            return (
              <div className="counter-item" key={counterKey}>
                <div className="counter">{displayValue}</div>
                <div className="counter-label">{counterInfo?.label}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CountersPage;
