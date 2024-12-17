'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DataService from '@/components/DataService'; // Import DataService
import '../EachEntity.css';
import PopulationChart from '@/components/PopulationChart/PopulationChart';
import PopulationMap from '@/components/PopulationMap/PopulationMap';
import PopulationPyramid from '@/components/PopulationPyramid/PopulationPyramid';
import '@/components/SharedSearchBar.css';

// Import the JSON files
import countryNames from '@/jsonFiles/eachCountryNames.json';
import stateNames from '@/jsonFiles/usSateNames.json';
// import ParticleBackground from '@/components/ParticleBackground/ParticleBackground';
import { DataTopicTile } from '@/app/data-topics-landing-page/page'; // Remove DUMMY_DATA from imports

import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs/DynamicBreadcrumb';

const EachEntity = () => {
  const { selection, entityId } = useParams();
  const [entityData, setEntityData] = useState(null);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPopulation, setCurrentPopulation] = useState(null);
  const [populationChangeSinceJanFirst, setPopulationChangeSinceJanFirst] =
    useState(null);

  // State variables for median ages
  const [medianAge, setMedianAge] = useState(null);
  const [medianAgeMale, setMedianAgeMale] = useState(null);
  const [medianAgeFemale, setMedianAgeFemale] = useState(null);

  // State variables for intervals
  const [birthInterval, setBirthInterval] = useState(0);
  const [deathInterval, setDeathInterval] = useState(0);
  const [migrationInterval, setMigrationInterval] = useState(0);
  const [netChangeInterval, setNetChangeInterval] = useState(0);

  // New state variable for country or state paragraphs
  const [entityParagraphs, setEntityParagraphs] = useState(null);

  // State variables for search functionality
  const [searchTerm, setSearchTerm] = useState(''); // Initialize searchTerm

  // State variables for related topics
  const [relatedTopics, setRelatedTopics] = useState([]);
  const [relatedTopicsError, setRelatedTopicsError] = useState(null);

  // Fetch the list of entities (countries or states)
  useEffect(() => {
    const fetchEntities = () => {
      try {
        if (selection === 'EachState') {
          // Use the list of states from the JSON file
          const fetchedEntities = stateNames.map((state) => state.title);
          setEntities(fetchedEntities);
        } else if (selection === 'EachCountry') {
          // Use the list of countries from the JSON file
          const fetchedEntities = countryNames.map((country) => country.title);
          setEntities(fetchedEntities);
        } else {
          setEntities([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    fetchEntities();
  }, [selection]);

  // Fetch data for the selected entity
  useEffect(() => {
    const fetchEntityData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (selection && entityId) {
          const decodedEntityId = decodeURIComponent(entityId);
          const data = await DataService.getEntityData(
            selection,
            decodedEntityId,
          );
          const normalizedData = normalizeData(data, selection);
          setEntityData(normalizedData);

          // Fetch paragraphs using DataService
          if (selection === 'EachCountry') {
            const paragraphs =
              await DataService.getCountryParagraphs(decodedEntityId);
            setEntityParagraphs(paragraphs);
          } else if (selection === 'EachState') {
            const paragraphs =
              await DataService.getStateParagraphs(decodedEntityId);
            setEntityParagraphs(paragraphs);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selection && entityId) {
      fetchEntityData();
    }
  }, [selection, entityId]);

  // Normalize the data based on the type of entity
  const normalizeData = (data, type) => {
    if (type === 'EachState') {
      return normalizeStateData(data);
    } else if (type === 'EachCountry') {
      return normalizeCountryData(data);
    }
    return data;
  };

  // Normalize state data
  const normalizeStateData = (data) => {
    return {
      name: data ? data.id : entityId,
      landAreaKMSquare: data?.landAreaKm2 || 0,
      usPopulationRank2024: data?.populationRank || 0,
      usPopulationPercentage2024: data?.usStatePopulationPercentage2024 || 0,
      growthRate2024: data?.growthRate2024 || 0,
      birthsPerDay2024: data?.birthsPerDay || 0,
      deathsPerDay2024: data?.deathsPerDay || 0,
      migrationsPerDay2024: data?.migrationsPerDay || 0,
      netChangePerDay2024: data?.netChangePerDay || 0,
      populationOverTime:
        normalizePopulationOverTime(data?.populationByYear) || [],
      tenMostPopulatedCities: data?.top10LargestCities || [],
      sexRatioPopulations: data?.genderPopByAgeGroup || {},
      growthRateTenYear: data?.growthRateTenYear || {},
      populationRankTenYear: data?.populationRankTenYear || {},
      currentPopulation: data?.['2024population'] || 0,
    };
  };

  // Normalize country data
  const normalizeCountryData = (data) => {
    return {
      name: data.id,
      alphaCode: data.alphaCode || '',
      capitalOrLargestCity: data.capitalOrLargestCity || '',
      landAreaKMSquare: data.landAreaKMSquare || 0,
      populationDensity2023: data.populationDensity2023 || 0,
      worldPopulationRank2023: data.worldPopulationRank2023 || 0,
      worldPopulationPercentage2023: data.worldPopulationPercentage2023 || 0,
      yearFoundedOrIndependence: data.yearFoundedOrIndependence || '',
      growthRate2023: data.growthRate2023 || 0,
      birthsPerDay2023: data.birthsPerDay2023 || 0,
      deathsPerDay2023: data.deathsPerDay2023 || 0,
      migrationsPerDay2023: data.migrationsPerDay2023 || 0,
      netChangePerDay2023: data.netChangePerDay2023 || 0,
      gdpIMF: data.gdpIMF || 0,
      gdpWorldBank: data.gdpWorldBank || 0,
      populationOverTime: data.populationOverTime || [],
      tenMostPopulatedCities: data.tenMostPopulatedCities || [],
      sexRatioPopulations: data.SexRatioPopulations || {},
    };
  };

  // Helper function to normalize population over time for states
  const normalizePopulationOverTime = (populationByYear) => {
    if (!populationByYear) return [];
    return Object.entries(populationByYear)
      .map(([year, population]) => ({
        year: parseInt(year),
        population: population,
      }))
      .sort((a, b) => a.year - b.year);
  };

  // Calculate the current population
  const getCurrentPopulation = () => {
    if (selection === 'EachState') {
      return entityData?.currentPopulation || null;
    } else if (selection === 'EachCountry') {
      if (
        entityData?.populationOverTime &&
        entityData.populationOverTime.length > 0
      ) {
        const latestData =
          entityData.populationOverTime[
            entityData.populationOverTime.length - 1
          ];
        if (latestData && latestData.population) {
          return latestData.population;
        }
      }
    }
    return null;
  };

  // Get the population rank
  const getPopulationRank = () => {
    if (selection === 'EachCountry') {
      if (entityData?.worldPopulationRank2023) {
        return `Rank ${entityData.worldPopulationRank2023}`;
      }
    } else if (selection === 'EachState') {
      if (entityData?.usPopulationRank2024) {
        return `Rank ${entityData.usPopulationRank2024}`;
      }
    }
    return 'Data not available';
  };

  // Get the growth rate
  const getGrowthRate = () => {
    if (selection === 'EachCountry') {
      if (entityData?.growthRate2023) {
        return `${entityData.growthRate2023}%`;
      }
    } else if (selection === 'EachState') {
      if (entityData?.growthRate2024) {
        return `${(entityData.growthRate2024 * 100).toFixed(2)}%`;
      }
    }
    return 'Data not available';
  };

  // Get the population density
  const getDensity = () => {
    if (entityData?.landAreaKMSquare && getCurrentPopulation()) {
      const density = getCurrentPopulation() / entityData.landAreaKMSquare;
      return `${density.toFixed(2)} per km²`;
    }
    return 'Data not available';
  };

  // Get the area
  const getArea = () => {
    if (entityData?.landAreaKMSquare) {
      return `${entityData.landAreaKMSquare.toLocaleString()} km²`;
    }
    return 'Data not available';
  };

  // Calculate current population and other dynamic values
  useEffect(() => {
    if (entityData) {
      calculateCurrentPopulation();
      calculatePopulationChangeSinceJanFirst();
      calculateMedianAges();
      calculateIntervals();
    }
  }, [entityData]);

  // Calculate current population based on net change
  const calculateCurrentPopulation = () => {
    if (selection === 'EachCountry') {
      const lastPopulationData =
        entityData.populationOverTime[entityData.populationOverTime.length - 1];
      const basePopulation = lastPopulationData?.population || 0;
      const netChangePerDay = entityData.netChangePerDay2023 || 0;
      const lastDataYear = lastPopulationData?.year || new Date().getFullYear();

      const currentDate = new Date();
      const daysSinceLastData = Math.floor(
        (currentDate - new Date(`${lastDataYear}-01-01`)) /
          (1000 * 60 * 60 * 24),
      );

      const updatedPopulation =
        basePopulation + netChangePerDay * daysSinceLastData;
      setCurrentPopulation(Math.floor(updatedPopulation));
    } else if (selection === 'EachState') {
      const basePopulation = entityData?.currentPopulation || 0;
      const netChangePerDay = entityData.netChangePerDay2024 || 0;

      const currentDate = new Date();
      const janFirst = new Date(currentDate.getFullYear(), 0, 1);
      const daysSinceJanFirst = Math.floor(
        (currentDate - janFirst) / (1000 * 60 * 60 * 24),
      );

      const updatedPopulation =
        basePopulation + netChangePerDay * daysSinceJanFirst;
      setCurrentPopulation(Math.floor(updatedPopulation));
    }
  };

  // Calculate population change since January 1st
  const calculatePopulationChangeSinceJanFirst = () => {
    const currentDate = new Date();
    const janFirst = new Date(currentDate.getFullYear(), 0, 1);
    const daysSinceJanFirst = Math.floor(
      (currentDate - janFirst) / (1000 * 60 * 60 * 24),
    );
    let totalChange = 0;

    if (selection === 'EachCountry') {
      totalChange = (entityData?.netChangePerDay2023 || 0) * daysSinceJanFirst;
    } else if (selection === 'EachState') {
      totalChange = (entityData?.netChangePerDay2024 || 0) * daysSinceJanFirst;
    }

    setPopulationChangeSinceJanFirst(Math.floor(totalChange));
  };

  // Get the rate in seconds for events
  const getRateInSeconds = (perDayValue) => {
    if (perDayValue === 0) return 0;
    return 86400 / perDayValue;
  };

  // Calculate intervals for progress bars
  const calculateIntervals = () => {
    let birthInt, deathInt, migrationInt, netChangeInt;

    if (selection === 'EachCountry') {
      birthInt = getRateInSeconds(entityData.birthsPerDay2023);
      deathInt = getRateInSeconds(entityData.deathsPerDay2023);
      migrationInt = getRateInSeconds(entityData.migrationsPerDay2023);
      netChangeInt = getRateInSeconds(entityData.netChangePerDay2023);
    } else if (selection === 'EachState') {
      birthInt = getRateInSeconds(entityData.birthsPerDay2024);
      deathInt = getRateInSeconds(entityData.deathsPerDay2024);
      migrationInt = getRateInSeconds(entityData.migrationsPerDay2024);
      netChangeInt = getRateInSeconds(entityData.netChangePerDay2024);
    }

    setBirthInterval(birthInt);
    setDeathInterval(deathInt);
    setMigrationInterval(migrationInt);
    setNetChangeInterval(netChangeInt);
  };

  // Normalize SexRatioPopulations data
  const normalizeSexRatioPopulations = (sexRatioPopulations) => {
    return Object.entries(sexRatioPopulations).map(([ageGroup, values]) => ({
      ageGroup: ageGroup,
      malePopulation: values.Males || 0,
      femalePopulation: values.Females || 0,
    }));
  };

  // Calculate median ages
  const calculateMedianAges = () => {
    if (
      entityData.sexRatioPopulations &&
      Object.keys(entityData.sexRatioPopulations).length > 0
    ) {
      const data = normalizeSexRatioPopulations(entityData.sexRatioPopulations);

      // Function to calculate median from age group data
      const calculateMedian = (populationData, gender) => {
        let totalPopulation = 0;
        let cumulativePopulation = 0;
        const ageMidpoints = [];

        populationData.forEach((d) => {
          const [minAgeStr, maxAgeStr] = d.ageGroup.split('-');
          const minAge = parseInt(minAgeStr.replace('+', ''), 10);
          const maxAge = maxAgeStr ? parseInt(maxAgeStr, 10) : minAge;
          const midAge = (minAge + maxAge) / 2 || minAge;
          ageMidpoints.push({
            midAge: midAge,
            population: d[gender],
          });
          totalPopulation += d[gender];
        });

        ageMidpoints.sort((a, b) => a.midAge - b.midAge);

        const medianPopulation = totalPopulation / 2;
        for (let i = 0; i < ageMidpoints.length; i++) {
          cumulativePopulation += ageMidpoints[i].population;
          if (cumulativePopulation >= medianPopulation) {
            return ageMidpoints[i].midAge;
          }
        }
        return null;
      };

      // Calculate median ages
      const maleMedianAge = calculateMedian(data, 'malePopulation');
      const femaleMedianAge = calculateMedian(data, 'femalePopulation');
      const totalMedianAge = ((maleMedianAge + femaleMedianAge) / 2).toFixed(1);

      // Set the median ages in state
      setMedianAge(totalMedianAge);
      setMedianAgeMale(maleMedianAge.toFixed(1));
      setMedianAgeFemale(femaleMedianAge.toFixed(1));
    }
  };

  // Render paragraph sections
  const renderParagraph = (title, content) => {
    if (!content) return null;
    return (
      <section className="paragraph-section">
        {title && <h3>{title}</h3>}
        <p style={{ paddingLeft: 10, paddingRight: 10 }}>
          {cleanParagraph(content)}
        </p>
      </section>
    );
  };

  // Clean the paragraphs by removing unwanted introductory phrases
  const cleanParagraph = (text) => {
    if (!text) return '';
    const pattern =
      /^(Here is a draft paragraph.*?:|I aimed to provide concise information.*?:|Please let me know.*?:)\s*/i;
    return text.replace(pattern, '').trim();
  };

  // Filter entities based on search term
  const filteredEntities = entities.filter((entity) =>
    entity.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Fetch related topics
  useEffect(() => {
    const fetchRelatedTopics = async () => {
      try {
        let category = selection === 'EachCountry' ? 'Countries' : 'UsStates';
        const topicsList = await DataService.getTopicsList(category);
        if (topicsList && topicsList.length > 0) {
          // Randomly shuffle topics
          const shuffledTopics = topicsList.sort(() => 0.5 - Math.random());
          // Select the first 16 topics
          const selectedTopics = shuffledTopics.slice(0, 16);
          setRelatedTopics(selectedTopics);
        } else {
          setRelatedTopicsError('No related topics found.');
        }
      } catch (error) {
        console.error('Error fetching related topics:', error);
        setRelatedTopicsError('Failed to fetch related topics.');
      }
    };

    fetchRelatedTopics();
  }, [selection]);

  // Conditional rendering based on loading and error states
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!entityId) {
    return (
      <div className="each-entity-container">
        {/* <ParticleBackground /> */}
        <div className="title-container">
          <h1 className="page-title">
            {selection === 'EachState' ? 'US States' : 'Countries'}
          </h1>
        </div>
        <input
          type="text"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <div className="entity-grid">
          {filteredEntities.map((entity, index) => (
            <Link
              key={index}
              href={`/entity/${selection}/${encodeURIComponent(entity)}`}
              className="entity-item"
            >
              {entity}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!entityData) {
    // If data for the entity is not available yet, display a placeholder page
    return (
      <div className="each-entity-container">
        {/* Centered Title */}
        <div className="title-container">
          <h1 className="page-title">{decodeURIComponent(entityId)}</h1>
        </div>

        {/* Rest of the placeholder content */}
        <p>Data not available at this time.</p>
      </div>
    );
  }

  // Main render of the entity page
  return (
    <div className="each-entity-container">
      {/* Centered Title */}
      <div className="title-container">
        <DynamicBreadcrumbs />
        <h1 className="page-title">{entityData.name}</h1>
      </div>
      {/* Introduction Section */}
      <section className="each-entity-intro">
        <div className="content-split">
          <div className="content-left">
            {/* Entity Details with Single Pixel Line Separator */}
            <div className="entity-details">
              <h3>Population Rank</h3>
              <p>{getPopulationRank()}</p>
            </div>
            <hr className="entity-divider" />
            <div className="entity-details">
              <h3>Growth Rate</h3>
              <p>{getGrowthRate()}</p>
            </div>
            <hr className="entity-divider" />
            <div className="entity-details">
              <h3>Density</h3>
              <p>{getDensity()}</p>
            </div>
            <hr className="entity-divider" />
            <div className="entity-details">
              <h3>Area</h3>
              <p>{getArea()}</p>
            </div>
            <hr className="entity-divider" />
            <div className="content-left-paragraph">
              <p>
                The current population of {entityData.name} is{' '}
                {currentPopulation !== null
                  ? currentPopulation.toLocaleString()
                  : 'Data not available'}{' '}
                based on projections of the latest{' '}
                {selection === 'EachCountry'
                  ? 'United Nations'
                  : 'US Census Bureau'}{' '}
                data.
              </p>
            </div>
          </div>
          <div className="content-right">
            <div className="main-entity-content">
              {/* Population Heading, Value, and Chart */}
              <h3 className="population-heading">
                {entityData.name} Population 2024
              </h3>
              <h3 className="population-value">
                {currentPopulation !== null
                  ? currentPopulation.toLocaleString()
                  : 'Data not available'}
              </h3>
              {/* Population Chart */}
              <PopulationChart data={entityData.populationOverTime} />

              {/* Population Growth Paragraph */}
              {renderParagraph(
                `${entityData.name} Population Growth`,
                entityParagraphs?.['Population Growth'],
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Red Content Divider */}
      <section className="red-content-divider left-to-right"></section>

      {/* Population Change Section */}
      <section className="population-change-section">
        <div className="population-change-content">
          {/* Left Side */}
          <div className="population-change-left">
            <h3>Components of Population Change</h3>
            <div className="population-component">
              <p>
                One birth every{' '}
                {birthInterval > 0 ? birthInterval.toFixed(1) : 'N/A'} seconds
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill birth-progress"
                  style={{
                    animationDuration:
                      birthInterval > 0 ? `${birthInterval}s` : '0s',
                  }}
                ></div>
              </div>
            </div>
            <div className="population-component">
              <p>
                One death every{' '}
                {deathInterval > 0 ? deathInterval.toFixed(1) : 'N/A'} seconds
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill death-progress"
                  style={{
                    animationDuration:
                      deathInterval > 0 ? `${deathInterval}s` : '0s',
                  }}
                ></div>
              </div>
            </div>
            <div className="population-component">
              <p>
                One migration every{' '}
                {migrationInterval > 0 ? migrationInterval.toFixed(1) : 'N/A'}{' '}
                seconds
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill migration-progress"
                  style={{
                    animationDuration:
                      migrationInterval > 0 ? `${migrationInterval}s` : '0s',
                  }}
                ></div>
              </div>
            </div>
            <div className="population-component">
              <p>
                Net change every{' '}
                {netChangeInterval > 0 ? netChangeInterval.toFixed(1) : 'N/A'}{' '}
                seconds
              </p>
              <div className="progress-bar">
                <div
                  className="progress-fill net-change-progress"
                  style={{
                    animationDuration:
                      netChangeInterval > 0 ? `${netChangeInterval}s` : '0s',
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="population-change-right">
            <h3>{entityData.name} Population Clock</h3>
            <table className="population-clock-table">
              <tbody>
                <tr>
                  <td>
                    {entityData.name} Population (as of{' '}
                    {new Date().toLocaleDateString()}):
                  </td>
                  <td>
                    {currentPopulation !== null
                      ? currentPopulation.toLocaleString()
                      : 'Data not available'}
                  </td>
                </tr>
                <tr>
                  <td>Births per Day:</td>
                  <td>
                    {selection === 'EachCountry'
                      ? entityData.birthsPerDay2023
                        ? Math.floor(
                            entityData.birthsPerDay2023,
                          ).toLocaleString()
                        : 'N/A'
                      : entityData.birthsPerDay2024
                        ? Math.floor(
                            entityData.birthsPerDay2024,
                          ).toLocaleString()
                        : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Deaths per Day:</td>
                  <td>
                    {selection === 'EachCountry'
                      ? entityData.deathsPerDay2023
                        ? Math.floor(
                            entityData.deathsPerDay2023,
                          ).toLocaleString()
                        : 'N/A'
                      : entityData.deathsPerDay2024
                        ? Math.floor(
                            entityData.deathsPerDay2024,
                          ).toLocaleString()
                        : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Migrations per Day:</td>
                  <td>
                    {selection === 'EachCountry'
                      ? entityData.migrationsPerDay2023
                        ? Math.floor(
                            entityData.migrationsPerDay2023,
                          ).toLocaleString()
                        : 'N/A'
                      : entityData.migrationsPerDay2024
                        ? Math.floor(
                            entityData.migrationsPerDay2024,
                          ).toLocaleString()
                        : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Net Change per Day:</td>
                  <td>
                    {selection === 'EachCountry'
                      ? entityData.netChangePerDay2023
                        ? Math.floor(
                            entityData.netChangePerDay2023,
                          ).toLocaleString()
                        : 'N/A'
                      : entityData.netChangePerDay2024
                        ? Math.floor(
                            entityData.netChangePerDay2024,
                          ).toLocaleString()
                        : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td>Population Change since Jan 1st:</td>
                  <td>
                    {populationChangeSinceJanFirst !== null
                      ? populationChangeSinceJanFirst.toLocaleString()
                      : 'Data not available'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Red Content Divider */}
      <section className="red-content-divider right-to-left"></section>

      {/* Data Visualization */}
      <section className="data-viz-each-entity">
        <div className="population-pyramid-each-entity">
          <h3>{entityData.name} Population Pyramid 2024</h3>
          {entityData.sexRatioPopulations &&
          Object.keys(entityData.sexRatioPopulations).length > 0 ? (
            <div className="pyramid-container">
              <PopulationPyramid
                inputData={normalizeSexRatioPopulations(
                  entityData.sexRatioPopulations,
                )}
                currentPopulation={currentPopulation}
              />
            </div>
          ) : (
            <p>Data not available</p>
          )}
        </div>
        {/* Median Age Section */}
        <div className="median-age-section">
          <h3>{entityData.name} Median Age</h3>
          <div className="median-age-content">
            <div className="median-age-row">
              <div className="median-age-value">
                <strong>{medianAge ? medianAge : 'N/A'}</strong>
              </div>
              <div className="median-age-label">
                <strong>Total</strong>
              </div>
            </div>
            <hr className="entity-divider" />
            <div className="median-age-row">
              <div className="median-age-value">
                <strong>{medianAgeMale ? medianAgeMale : 'N/A'}</strong>
              </div>
              <div className="median-age-label">
                <strong>Male</strong>
              </div>
            </div>
            <hr className="entity-divider" />
            <div className="median-age-row">
              <div className="median-age-value">
                <strong>{medianAgeFemale ? medianAgeFemale : 'N/A'}</strong>
              </div>
              <div className="median-age-label">
                <strong>Female</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Red Content Divider */}
      <section className="red-content-divider left-to-right"></section>

      {/* Largest Cities Section */}
      <section className="additional-country-data">
        <div className="additional-content-split">
          {/* Left Side: List and Paragraph */}
          <div className="additional-content-left">
            {entityData.tenMostPopulatedCities &&
            entityData.tenMostPopulatedCities.length > 0 ? (
              <ul>
                {entityData.tenMostPopulatedCities.map((city, index) => (
                  <li
                    key={index}
                    id={`city-${city.name.replace(/\s+/g, '-')}`}
                    className="city-list-item"
                  >
                    {city.name}: {city.population.toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Data not available</p>
            )}

            {renderParagraph(
              `Largest Cities in ${entityData.name}`,
              entityParagraphs?.['Largest Cities'],
            )}
          </div>
          {/* Right Side: Map */}
          <PopulationMap
            selection={selection}
            countryName={entityData.name}
            cities={entityData.tenMostPopulatedCities}
          />
        </div>
      </section>

      {/* Red Content Divider */}
      <section className="red-content-divider right-to-left"></section>

      {/* Remaining Paragraphs */}
      <div className="about-paragraphs-each-entity">
        {selection === 'EachCountry' ? (
          <>
            {renderParagraph(
              `General ${entityData.name} Information`,
              entityParagraphs?.['General Country Information'],
            )}
            {renderParagraph(
              `${entityData.name} Demographics`,
              entityParagraphs?.['Country Demographics'],
            )}
            {renderParagraph(
              `${entityData.name} Religion, Economy, and Politics`,
              entityParagraphs?.['Religion, Economy, and Politics'],
            )}
            {renderParagraph(
              `${entityData.name} Population History`,
              entityParagraphs?.['Population History'],
            )}
          </>
        ) : (
          <>
            {renderParagraph(
              `${entityData.name} Introduction`,
              entityParagraphs?.['Intro To State Data'],
            )}
            {renderParagraph(
              `${entityData.name} Area and Population Density`,
              entityParagraphs?.['Area and Population Density'],
            )}
            {renderParagraph(
              `${entityData.name} Population Growth`,
              entityParagraphs?.['Population Growth'],
            )}
            {renderParagraph(
              `${entityData.name} Population History`,
              entityParagraphs?.['Population History'],
            )}
            {renderParagraph(
              `${entityData.name} Population Projections`,
              entityParagraphs?.['Population Projections'],
            )}
            {renderParagraph(
              `${entityData.name} Boundary, Census, and Statehood History`,
              entityParagraphs?.['Boundary, Census, and Statehood History'],
            )}
            {renderParagraph(
              `${entityData.name} Area and Religion Statistics`,
              entityParagraphs?.['Area and Religion Statistics'],
            )}
          </>
        )}
      </div>

      {/* Red Content Divider */}
      <section className="red-content-divider left-to-right"></section>

      {/* Related Topics Section */}
      {/* Related Topics Section */}
      <section className="related-topics">
        <h3>Browse Related Topics</h3>
        <div className="each-entity--related-topics-wrapper">
          {relatedTopics.length > 0 ? (
            relatedTopics.map((topic, index) => {
              const basePath =
                selection === 'EachCountry' ? '/Countries' : '/UsStates';
              return (
                <Link
                  key={index}
                  href={`${basePath}/${encodeURIComponent(topic)}`}
                  style={{ textDecoration: 'none', color: 'black' }} // Set text color to black
                >
                  <DataTopicTile
                    title={topic}
                    text="View a complete breakdown and overview" // Provide text if available
                    showLogo={false}
                  />
                </Link>
              );
            })
          ) : relatedTopicsError ? (
            <p>{relatedTopicsError}</p>
          ) : (
            <p>Loading related topics...</p>
          )}
        </div>
      </section>
      {/* Red Content Divider */}
      <section className="red-content-divider left-to-right"></section>

      {/* Sources */}
      <section className="sources">
        <h3>Sources</h3>
        <ul>
          <li>
            <a
              href="https://www.gapminder.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GapMinder
            </a>
          </li>
          <li>
            <a
              href="https://www.un.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              United Nations
            </a>
          </li>
          <li>
            <a
              href="https://www.census.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              US Census Bureau
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default EachEntity;
