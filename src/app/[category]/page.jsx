// DataPage.jsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DataService from '@/components/DataService';
import WorldMap from '@/components/WorldMap';
import USStatesMap from '@/components/USStatesMap';
import CountryRankingGraph from '@/components/CountryRankingGraph';
import './DataPage.css';
import CountryMap from '@/components/CountryMap';
import countriesDataTopics from '../../jsonFiles/countriesDataTopics.json';
import usStatesDataTopics from '../../jsonFiles/usStatesDataTopics.json';
import '@/components/SharedSearchBar.css';
import ParticleBackground from '@/components/ParticleBackground';
import { DataTopicTile } from '@/app/data-topics-landing-page/page';
import DynamicBreadcrumbs from '@/components/DynamicBreadcrumbs/DynamicBreadcrumb';
import EntityBarGraph from '@/components/EntityBarGraph'; // Import the new component

function DataPage() {
  const { category, topicId } = useParams();
  const [topics, setTopics] = useState([]);
  const [data, setData] = useState(null);
  const [paragraphs, setParagraphs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [selectedField, setSelectedField] = useState(null);
  const [showTopEntities, setShowTopEntities] = useState(true);
  const isUSData = category === 'UsStates';

  const [relatedTopics, setRelatedTopics] = useState([]);
  const [relatedTopicsError, setRelatedTopicsError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getDisplayTitle = () => {
    if (category === 'Countries') {
      return 'Country Topics';
    } else if (category === 'UsStates') {
      return 'U.S. State Topics';
    }
    return `${category} Topics`; // fallback for any other categories
  };

  useEffect(() => {
    function fetchTopics() {
      try {
        let fetchedTopics = [];
        if (category === 'UsStates') {
          fetchedTopics = usStatesDataTopics;
        } else {
          fetchedTopics = countriesDataTopics;
        }
        setTopics(fetchedTopics);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch topics: ' + err.message);
        setLoading(false);
      }
    }

    fetchTopics();
  }, [category]);

  useEffect(() => {
    async function fetchData() {
      if (topicId) {
        const decodedTopicId = decodeURIComponent(topicId);
        try {
          const fetchedData = await DataService.getTopic(
            category,
            decodedTopicId,
          );
          const processedData = processData(fetchedData);
          setData(processedData);
          const fields = Object.keys(
            processedData[Object.keys(processedData)[0]] || {},
          ).filter((key) => key !== 'country' && key !== 'state');
          setSelectedField(fields[0]);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch topic data: ' + err.message);
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [category, topicId]);

  useEffect(() => {
    async function fetchParagraphs() {
      if (topicId) {
        const decodedTopicId = decodeURIComponent(topicId);
        try {
          const paragraphData = await DataService.getParagraphs(
            category,
            decodedTopicId,
          );
          setParagraphs(paragraphData);
        } catch (err) {
          setError('Failed to fetch paragraphs: ' + err.message);
        }
      }
    }
    fetchParagraphs();
  }, [category, topicId]);

  useEffect(() => {
    async function fetchRelatedTopics() {
      try {
        const otherTopics = topics.filter(
          (topic) => topic.title !== decodeURIComponent(topicId),
        );
        if (otherTopics.length > 0) {
          const shuffledTopics = otherTopics.sort(() => 0.5 - Math.random());
          const selectedTopics = shuffledTopics.slice(0, 16);
          setRelatedTopics(selectedTopics);
        } else {
          setRelatedTopicsError('No related topics found.');
        }
      } catch (error) {
        setRelatedTopicsError('Failed to fetch related topics.');
      }
    }

    if (topics.length > 0 && topicId) {
      fetchRelatedTopics();
    }
  }, [topics, topicId]);

  const processData = (rawData) => {
    const processed = {};

    if (Array.isArray(rawData.data)) {
      rawData.data.forEach((item) => {
        const key = isUSData ? item.state : item.country;
        if (
          !key ||
          key.toLowerCase() === 'total' ||
          (isUSData &&
            (key.toLowerCase() === 'usa' ||
              key.toLowerCase() === 'united states'))
        ) {
          return;
        }
        const sanitizedItem = {};
        Object.keys(item).forEach((field) => {
          if (typeof item[field] === 'number' && isNaN(item[field])) {
            sanitizedItem[field] = null;
          } else {
            sanitizedItem[field] = item[field];
          }
        });
        processed[key] = { ...sanitizedItem };
      });
    }
    return processed;
  };

  const handleEntityHover = (entity) => {
    setHoveredEntity(entity);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!topicId) {
    return (
      <div className="data-page">
        <ParticleBackground />
        <h1 className="page-title-data-page">{getDisplayTitle()}</h1>
        <input
          type="text"
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <div className="topic-grid">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => (
              <Link
                key={topic.title}
                href={`/${category}/${encodeURIComponent(topic.title)}`}
                className="topic-item"
              >
                {topic.title}
              </Link>
            ))
          ) : (
            <p>No topics found</p>
          )}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="no-data">No data found for topic: {topicId}</div>;
  }

  // Prepare field names and sort them alphabetically
  const orderedFieldNames = Object.keys(data[Object.keys(data)[0]] || {})
    .filter((key) => key !== 'country' && key !== 'state')
    .sort((a, b) => a.localeCompare(b));

  // Calculate ranks for each entity
  const computeRanks = (data, orderedFieldNames) => {
    const ranks = {};
    orderedFieldNames.forEach((field) => {
      const entitiesWithField = Object.entries(data)
        .filter(([entity, entityData]) => entityData[field] != null)
        .sort((a, b) => b[1][field] - a[1][field]); // Descending order

      entitiesWithField.forEach(([entity, entityData], index) => {
        if (!ranks[entity]) {
          ranks[entity] = {};
        }
        ranks[entity][field] = index + 1;
      });
    });
    return ranks;
  };

  const ranks = computeRanks(data, orderedFieldNames);

  // Extract summary from paragraphs
  const summary = paragraphs
    ? paragraphs.Summary ||
      paragraphs.summary ||
      paragraphs['summary'] ||
      paragraphs['Summary']
    : null;

  return (
    <div className="data-page">
      <div className="top-section">
        <DynamicBreadcrumbs />
        <h1 className="page-title">{decodeURIComponent(topicId)}</h1>
        <TopSection
          data={data}
          hoveredEntity={hoveredEntity}
          selectedField={selectedField}
          onEntityHover={handleEntityHover}
          isUSData={isUSData}
        />
      </div>

      <div className="dp-main-container">
        <div className="graph-section">
          <div className="graph-button-container">
            <button
              onClick={() => setShowTopEntities(true)}
              className={showTopEntities ? 'active' : ''}
            >
              Top 10
            </button>
            <button
              onClick={() => setShowTopEntities(false)}
              className={!showTopEntities ? 'active' : ''}
            >
              Bottom 10
            </button>
          </div>
          <div className="graph-container">
            <CountryRankingGraph
              data={data}
              selectedField={selectedField}
              showTopEntities={showTopEntities}
              isUSData={isUSData}
            />
          </div>
        </div>
        <div className="map-section">
          <div className="map-button-container">
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="field-selector"
            >
              {orderedFieldNames.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <button onClick={() => setShowMap(!showMap)}>
              {showMap ? 'Show Table' : 'Show Map'}
            </button>
          </div>

          <div
            className="second-map-container"
            style={{
              maxHeight: !showMap ? 600 : 'none',
              overflowY: !showMap ? 'scroll' : 'auto',
            }}
          >
            {console.log(
              'Rendering map. showMap:',
              showMap,
              'isUSData:',
              isUSData,
              'selectedField:',
              selectedField,
            )}

            {showMap ? (
              isUSData ? (
                <USStatesMap
                  data={data}
                  selectedField={selectedField}
                  onStateHover={handleEntityHover}
                />
              ) : (
                <WorldMap
                  data={data}
                  selectedField={selectedField}
                  onCountryHover={handleEntityHover}
                />
              )
            ) : (
              <DataTable
                data={data}
                isUSData={isUSData}
                containerClassName="table-container-map"
                hideTitle={true}
              />
            )}
          </div>
        </div>
      </div>

      <SummarySection summary={summary} />

      <DataTable data={data} isUSData={isUSData} />

      {/* Add H1 Title before the new section */}
      <h1 className="data-topic-title">{decodeURIComponent(topicId)}</h1>

      {/* New Section: Entity Sections */}
      <div className="entity-sections">
        {Object.keys(data).map((entity) => (
          <EntitySection
            key={entity}
            entity={entity}
            data={data[entity]}
            allData={data}
            ranks={ranks[entity]}
            isUSData={isUSData}
            orderedFieldNames={orderedFieldNames}
          />
        ))}
      </div>

      <FieldExplanationsSection
        explanations={paragraphs}
        orderedFieldNames={orderedFieldNames}
      />

      {/* Related Topics Section */}
      <section className="related-topics">
        <h2 style={{ alignSelf: 'stretch' }}>Browse Related Topics</h2>
        <div className="each-entity--related-topics-wrapper">
          {relatedTopics.length > 0 ? (
            relatedTopics.map((topic, index) => {
              const basePath =
                category === 'Countries' ? '/Countries' : '/UsStates';
              return (
                <Link
                  key={index}
                  href={`${basePath}/${encodeURIComponent(topic.title)}`}
                  style={{ textDecoration: 'none', color: 'black' }}
                >
                  <DataTopicTile
                    title={topic.title}
                    text="View a complete breakdown and overview"
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

      <Link
        href={`/${category}`}
        className="back-link"
        style={{ color: 'red' }}
      >
        Back to Topics
      </Link>
    </div>
  );
}

// EntitySection Component
function EntitySection({
  entity,
  data,
  allData,
  ranks,
  isUSData,
  orderedFieldNames,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedField, setSelectedField] = useState(orderedFieldNames[0]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="entity-section">
      <div className="entity-header">
        <h3>{entity}</h3>
        <button onClick={toggleExpand} className="expand-button">
          {isExpanded ? '-' : '+'}
        </button>
      </div>
      <div className="divider" />
      {isExpanded && (
        <div className="expanded-view">
          <div className="data-points-expanded">
            {orderedFieldNames.map((field) => (
              <div className="data-point-expanded" key={field}>
                <div className="data-label-expanded">{field}</div>
                <div className="vertical-divider-expanded" />
                <div className="data-rank-expanded">
                  Rank: {ranks[field]} out of {Object.keys(allData).length}
                </div>
              </div>
            ))}
          </div>
          {/* Only show the graph if it's U.S. States */}
          {isUSData && (
            <>
              <div className="field-selector-expanded">
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="field-selector"
                >
                  {orderedFieldNames.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
              <div className="entity-bar-graph-container">
                <EntityBarGraph
                  data={allData}
                  field={selectedField}
                  currentEntity={entity}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TopSection({
  data,
  hoveredEntity,
  selectedField,
  onEntityHover,
  isUSData,
}) {
  const globalAverages = useMemo(() => {
    return calculateGlobalAverages(data, isUSData);
  }, [data, isUSData]);

  const entityData = hoveredEntity ? data[hoveredEntity] : null;
  const displayData = entityData || globalAverages;

  const orderedFields = Object.keys(displayData)
    .filter((key) => key !== 'country' && key !== 'state')
    .sort((a, b) => a.localeCompare(b));

  const renderDataPoint = (key, value) => (
    <div key={key} className="data-point">
      <DataValue>
        {typeof value === 'number'
          ? value.toFixed(2)
          : value !== null
            ? value
            : 'N/A'}
      </DataValue>
      <div className="data-label">{key}</div>
      <div className="data-entity">
        {hoveredEntity || (isUSData ? 'US Average' : 'Global Average')}
      </div>
    </div>
  );

  return (
    <div className="top-section-content">
      <div className="map-container first-map">
        <CountryMap
          country={isUSData ? null : hoveredEntity}
          state={isUSData ? hoveredEntity : null}
          data={data}
          selectedField={selectedField}
          isUSData={isUSData}
          onEntityHover={onEntityHover}
        />
      </div>
      <div className="data-points">
        {orderedFields.slice(0, 3).map((key) => {
          const value = displayData[key];
          return renderDataPoint(key, value);
        })}
      </div>
    </div>
  );
}

function DataValue({ children }) {
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipStyle({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="data-value"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isHovered && (
        <div className="tooltip-data-page" style={tooltipStyle}>
          {children}
        </div>
      )}
    </div>
  );
}

function calculateGlobalAverages(data, isUSData) {
  const averages = {};
  const counters = {};

  Object.entries(data).forEach(([entity, entityData]) => {
    if (
      entity.toLowerCase() === 'total' ||
      (isUSData &&
        (entity.toLowerCase() === 'usa' ||
          entity.toLowerCase() === 'united states'))
    ) {
      return;
    }

    Object.entries(entityData).forEach(([key, value]) => {
      if (
        key !== 'country' &&
        key !== 'state' &&
        key.toLowerCase() !== 'total'
      ) {
        if (typeof value === 'number') {
          if (!averages[key]) {
            averages[key] = 0;
            counters[key] = 0;
          }
          averages[key] += value;
          counters[key]++;
        } else if (typeof value === 'string' && !averages[key]) {
          averages[key] = value;
        }
      }
    });
  });

  Object.keys(averages).forEach((key) => {
    if (typeof averages[key] === 'number') {
      averages[key] /= counters[key];
    }
  });

  return averages;
}

function SummarySection({ summary }) {
  return (
    <div className="summary-section">
      <h2>Summary</h2>
      {summary ? <p>{summary}</p> : <p>No summary available.</p>}
    </div>
  );
}

function DataTable({ data, isUSData, containerClassName, hideTitle }) {
  const fieldNames = Object.keys(data[Object.keys(data)[0]] || {}).filter(
    (key) => key !== 'country' && key !== 'state',
  );

  const entityLabel = isUSData ? 'State' : 'Country';
  const headers = [entityLabel, ...fieldNames];

  const rows = Object.entries(data).map(([entity, entityData]) => {
    const rowData = [entity];
    fieldNames.forEach((field) => {
      rowData.push(entityData[field]);
    });
    return rowData;
  });

  const containerClass = containerClassName || 'table-container';

  return (
    <div className="data-table-section">
      {!hideTitle && <h2>Data Table</h2>}
      <div className={containerClass}>
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowData, idx) => (
              <tr key={idx}>
                {rowData.map((cellData, idx2) => (
                  <td key={idx2}>{cellData !== null ? cellData : 'N/A'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FieldExplanationsSection({ explanations, orderedFieldNames }) {
  if (!explanations) {
    return (
      <div className="summary-section">
        <h2>Field Explanations</h2>
        <p>No field explanations available.</p>
      </div>
    );
  }

  const explanationsNormalized = {};
  Object.keys(explanations).forEach((key) => {
    if (key.toLowerCase() !== 'summary') {
      explanationsNormalized[key.toLowerCase()] = explanations[key];
    }
  });

  return (
    <div className="summary-section">
      <h2>Field Explanations</h2>
      {orderedFieldNames.length > 0 ? (
        orderedFieldNames.map((key) => {
          const explanation = explanationsNormalized[key.toLowerCase()];
          if (!explanation) {
            return (
              <div key={key}>
                <p>
                  <strong>{key}:</strong> Explanation not available.
                </p>
              </div>
            );
          }

          return (
            <div key={key}>
              <p>
                <strong>{key}:</strong> {explanation}
              </p>
            </div>
          );
        })
      ) : (
        <p>No field explanations available.</p>
      )}
    </div>
  );
}

export default DataPage;
