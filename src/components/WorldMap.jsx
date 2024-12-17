import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import '@/components/WorldMapsForHome/WorldMapForHome.css';

const WorldMap = ({
  data,
  selectedField,
  onCountryHover,
  showLegend = true,
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const tooltipRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });
  const [showTooltip, setShowTooltip] = useState(window.innerWidth < 768);

  const normalizeCountryName = (name) => {
    const normalizationMap = {
      'United States of America': 'United States',
      'Dem. Rep. Congo': 'DR Congo',
      'Central African Rep.': 'Central Africa',
      Czechia: 'Czech Republic',
      Congo: 'Republic of The Congo',
      Somaliland: 'Somalia',
      "Côte d'Ivoire": "Cote d'Ivoire",
      'S. Sudan': 'South Sudan',
      'Bosnia and Herz.': 'Bosnia and Herzegovina',
    };
    const normalizedName = normalizationMap[name] || name;
    // console.log(`Normalizing country name: ${name} -> ${normalizedName}`);
    return normalizedName;
  };

  const colorPalette = useMemo(
    () => [
      '#E6B3B3',
      '#B3E6B3',
      '#B3B3E6',
      '#E6E6B3',
      '#E6B3E6',
      '#B3E6E6',
      '#F2D1D1',
      '#D1F2D1',
      '#D1D1F2',
      '#F2F2D1',
      '#F2D1F2',
      '#D1F2F2',
      '#FFE0E0',
      '#E0FFE0',
      '#E0E0FF',
      '#FFFFE0',
      '#FFE0FF',
      '#E0FFFF',
      '#FFEEDD',
      '#DDFFEE',
    ],
    [],
  );

  // const getCategoryColor = (category, index) => colorPalette[index % colorPalette.length];

  const processedData = useMemo(() => {
    if (!data || !selectedField) return null;

    console.log('Processing data for field:', selectedField);
    console.log('Raw data:', data);

    const isShortAnswer = (str) => str.split(' ').length <= 3;
    const answerCounts = {};
    let roughEstimateCount = 0;
    let numericCount = 0;

    const processed = Object.entries(data).map(([country, values]) => {
      const value = values[selectedField];

      if (typeof value === 'number' && !isNaN(value)) {
        numericCount++;
        return { country, value, type: 'numeric' };
      } else if (typeof value === 'string' && value.trim() !== '') {
        if (isShortAnswer(value)) {
          answerCounts[value] = (answerCounts[value] || 0) + 1;
          return { country, value, type: 'short' };
        } else {
          roughEstimateCount++;
          return { country, value: 'Rough Estimate', type: 'long' };
        }
      } else {
        console.warn(`Invalid data for ${country}: ${value}`);
        return { country, value: 'N/A', type: 'invalid' };
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

    console.log('Processed data:', processed);
    return {
      data: processed,
      mostCommonAnswer: mostCommonAnswer ? mostCommonAnswer[0] : null,
      mostCommonAnswerRatio,
      roughEstimateCount,
      numericCount,
    };
  }, [data, selectedField]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!processedData || dimensions.width === 0 || dimensions.height === 0)
      return;

    console.log('Rendering map with processed data:', processedData);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g');

    d3.json(
      'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    ).then((world) => {
      const countries = feature(world, world.objects.countries).features.filter(
        (d) => d.properties.name !== 'Antarctica',
      );

      console.log(
        'D3 country data:',
        countries.map((c) => c.properties.name),
      );

      const projection = d3
        .geoMercator()
        .fitSize([dimensions.width, dimensions.height], {
          type: 'FeatureCollection',
          features: countries,
        });

      const path = d3.geoPath().projection(projection);

      if (processedData.numericCount > 0) {
        const colorScale = d3.scaleSequential(d3.interpolateReds).domain(
          d3.extent(
            processedData.data.filter((d) => d.type === 'numeric'),
            (d) => d.value,
          ),
        );

        g.selectAll('path')
          .data(countries)
          .join('path')
          .attr('d', path)
          .attr('fill', (d) => {
            const normalizedName = normalizeCountryName(d.properties.name);
            const countryData = processedData.data.find(
              (c) => c.country === normalizedName,
            );
            // console.log(`Filling country: ${d.properties.name} (normalized: ${normalizedName}) with data:`, countryData);
            return countryData && countryData.type === 'numeric'
              ? colorScale(countryData.value)
              : '#ccc';
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseover', (event, d) => {
            const normalizedName = normalizeCountryName(d.properties.name);
            console.log(
              `Hovering over: ${d.properties.name} (normalized: ${normalizedName})`,
            );
            onCountryHover(normalizedName);
            const tooltip = tooltipRef.current;
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
            tooltip.innerHTML = `<strong>${d.properties.name}</strong>`;
          })
          .on('mousemove', (event) => {
            const tooltip = tooltipRef.current;
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
          })
          .on('mouseout', () => {
            const tooltip = tooltipRef.current;
            tooltip.style.display = 'none';
            onCountryHover(null);
          });

        if (showLegend) {
          // Add numeric legend here
        }
      } else if (
        processedData.roughEstimateCount >
        processedData.data.length / 2
      ) {
        // Display message for primarily text data
        g.selectAll('path')
          .data(countries)
          .join('path')
          .attr('d', path)
          .attr('fill', '#FFA1A9') // Uniform red color
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5);

        svg
          .append('text')
          .attr('x', dimensions.width / 2)
          .attr('y', dimensions.height / 2)
          .attr('text-anchor', 'middle')
          .attr('font-size', '24px')
          .attr('font-weight', 'bold')
          .attr('fill', '#000')
          .text('Primarily Text Data for this entry');

        svg
          .append('text')
          .attr('x', dimensions.width / 2)
          .attr('y', dimensions.height / 2 + 30)
          .attr('text-anchor', 'middle')
          .attr('font-size', '18px')
          .attr('fill', '#000')
          .text('Please refer to the Table for details');
      } else {
        // Handle categorical data
        const categories = [
          ...new Set(
            processedData.data
              .filter((d) => d.type === 'short')
              .map((d) => d.value),
          ),
        ];
        const categoryColorScale = d3
          .scaleOrdinal()
          .domain(categories)
          .range(colorPalette);

        g.selectAll('path')
          .data(countries)
          .join('path')
          .attr('d', path)
          .attr('fill', (d) => {
            const countryData = processedData.data.find(
              (c) => c.country === normalizeCountryName(d.properties.name),
            );
            return countryData && countryData.type === 'short'
              ? categoryColorScale(countryData.value)
              : '#ccc';
          })
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseover', (event, d) => {
            onCountryHover(normalizeCountryName(d.properties.name));
          })
          .on('mouseout', () => {
            onCountryHover(null);
          });

        if (showLegend) {
          // Add categorical legend here
        }
      }
    });
  }, [processedData, dimensions, showLegend, colorPalette]);

  return (
    <div
      ref={containerRef}
      className="world-map-container"
      style={{ width: '100%', height: '100%' }}
    >
      <svg ref={svgRef} width="100%" height="100%"></svg>
      {showTooltip && (
        <div ref={tooltipRef} className="tooltip-data-page"></div>
      )}
    </div>
  );
};

export default WorldMap;
