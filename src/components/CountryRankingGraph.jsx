// CountryRankingGraph.jsx

import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from 'react';
import * as d3 from 'd3';

const getEntityAbbreviation = (entityName) => {
  const abbreviations = {
    'United States': 'USA',
    'United Kingdom': 'UK',
    France: 'FR',
    Germany: 'DE',
    Italy: 'IT',
    Spain: 'ES',
    Canada: 'CA',
    Japan: 'JP',
    Australia: 'AU',
    Brazil: 'BR',
  };

  if (abbreviations[entityName]) {
    return abbreviations[entityName];
  } else {
    const words = entityName.split(' ');
    if (words.length === 1) {
      return entityName.slice(0, 3).toUpperCase();
    } else if (words.length >= 2) {
      return (words[0].slice(0, 3) + words[1].slice(0, 3)).toUpperCase();
    }
  }
};

const CountryRankingGraph = ({
  data,
  selectedField,
  showTopEntities,
  isUSData,
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const processedData = useMemo(() => {
    if (!data || !selectedField) return null;

    const isShortAnswer = (str) => str.split(' ').length <= 3;
    const answerCounts = {};
    let roughEstimateCount = 0;
    let numericCount = 0;

    const processed = Object.entries(data).map(([entity, values]) => {
      const value = values[selectedField];

      if (
        typeof value === 'number' ||
        (!isNaN(Number(value)) && value !== null)
      ) {
        numericCount++;
        return { entity, value: Number(value), type: 'numeric' };
      } else if (typeof value === 'string') {
        if (isShortAnswer(value)) {
          answerCounts[value] = (answerCounts[value] || 0) + 1;
          return { entity, value, type: 'short' };
        } else {
          roughEstimateCount++;
          return { entity, value: 'Rough Estimate', type: 'long' };
        }
      } else {
        console.warn(`Unknown data type for ${entity}: ${typeof value}`);
        return { entity, value: 'N/A', type: 'unknown' };
      }
    });

    const totalShortAnswers = Object.values(answerCounts).reduce(
      (a, b) => a + b,
      0,
    );
    const mostCommonAnswer = Object.entries(answerCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const mostCommonAnswerRatio = mostCommonAnswer
      ? ((mostCommonAnswer[1] / totalShortAnswers) * 100).toFixed(2)
      : 0;

    return {
      data: processed,
      mostCommonAnswer: mostCommonAnswer ? mostCommonAnswer[0] : null,
      mostCommonAnswerRatio,
      roughEstimateCount,
      numericCount,
    };
  }, [data, selectedField]);

  const closePopup = useCallback(
    (e) => {
      if (showInfoPopup && !containerRef.current.contains(e.target)) {
        setShowInfoPopup(false);
      }
    },
    [showInfoPopup],
  );

  useEffect(() => {
    window.addEventListener('click', closePopup);
    return () => window.removeEventListener('click', closePopup);
  }, [closePopup]);

  useEffect(() => {
    if (!processedData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    const margin = { top: 40, right: 30, bottom: 40, left: 80 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sortedData = processedData.data
      .filter((d) => d.type === 'numeric')
      .sort((a, b) => (showTopEntities ? b.value - a.value : a.value - b.value))
      .slice(0, 10);

    const x = d3
      .scaleLinear()
      .range([0, graphWidth])
      .domain([0, d3.max(sortedData, (d) => d.value)]);
    const colorScale = d3.scaleSequential(d3.interpolateReds).domain(
      d3.extent(
        processedData.data.filter((d) => d.type === 'numeric'),
        (d) => d.value,
      ),
    );
    const y = d3
      .scaleBand()
      .range([0, graphHeight])
      .domain(sortedData.map((d) => d.entity))
      .padding(0.1);

    // Render bars
    g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d) => y(d.entity))
      .attr('width', (d) => x(d.value))
      .attr('height', y.bandwidth())
      .attr('fill', (d) => {
        const stateData = processedData.data.find((c) => c.entity === d.entity);
        return colorScale(stateData.value);
      });

    // Render entity names
    g.selectAll('.label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', -5)
      .attr('y', (d) => y(d.entity) + y.bandwidth() / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text((d) => d.entity);

    // Render bar values
    g.selectAll('.value')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', (d) => x(d.value) + 5)
      .attr('y', (d) => y(d.entity) + y.bandwidth() / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'start')
      .text((d) => d.value.toFixed(2));

    // Render x-axis
    g.append('g')
      .attr('transform', `translate(0,${graphHeight})`)
      .call(d3.axisBottom(x).ticks(5));

    // Render title and info icon
    const titleGroup = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${margin.top / 2})`);

    titleGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(`${showTopEntities ? 'Top 10' : 'Bottom 10'} - ${selectedField}`);

    // Info icon
    titleGroup
      .append('text')
      .attr('x', -90)
      .attr('y', 15)
      .attr('text-anchor', 'end')
      .style('font-size', '14px')
      .style('cursor', 'pointer')
      .text('[i]')
      .on('click', (e) => {
        e.stopPropagation();
        setShowInfoPopup(!showInfoPopup);
      });
  }, [processedData, selectedField, showTopEntities]);

  if (!processedData) {
    return <div>Loading...</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      {showInfoPopup && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: '10px',
            background: 'white',
            border: '1px solid black',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          <h3>{selectedField}</h3>
          <p>Numeric data points: {processedData.numericCount}</p>
          {processedData.mostCommonAnswer && (
            <p>
              Most common answer: {processedData.mostCommonAnswer} (Ratio:{' '}
              {processedData.mostCommonAnswerRatio}%)
            </p>
          )}
          <p>
            {isUSData ? 'States' : 'Countries'} with detailed info:{' '}
            {processedData.roughEstimateCount}
          </p>
        </div>
      )}
    </div>
  );
};

export default CountryRankingGraph;
