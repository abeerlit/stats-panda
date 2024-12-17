import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import './PopulationMap.css';

const PopulationMap = ({ selection, countryName, cities }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(() => {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }, 300);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(window.resizeTimeout);
    };
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = svgRef.current.getBoundingClientRect();

    const countryFillColor = '#ccc';
    const countryStrokeColor = '#333';
    const adminStrokeColor = '#aaa';

    // Function to format country name for URL
    const formatCountryNameForURL = (name) => {
      return name.toLowerCase().replace(/\s+/g, '-');
    };

    if (selection === 'EachCountry') {
      // Load the world map data
      d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then((worldData) => {
          const countries = feature(
            worldData,
            worldData.objects.countries,
          ).features;
          const countryData = countries.find(
            (d) =>
              d.properties.name.toLowerCase() === countryName.toLowerCase(),
          );

          if (!countryData) {
            console.error(`Country not found: ${countryName}`);
            return;
          }

          const projection = d3
            .geoMercator()
            .fitSize([width, height * 0.9], countryData);
          const path = d3.geoPath().projection(projection);

          // Draw the country
          svg
            .append('path')
            .datum(countryData)
            .attr('d', path)
            .attr('fill', countryFillColor)
            .attr('stroke', countryStrokeColor);

          // Attempt to load administrative boundaries
          d3.json(
            `https://raw.githubusercontent.com/deldersveld/topojson/master/countries/${formatCountryNameForURL(
              countryName,
            )}-provinces.json`,
          )
            .then((adminData) => {
              if (adminData) {
                const adminFeatures = feature(
                  adminData,
                  Object.values(adminData.objects)[0],
                ).features;
                svg
                  .append('g')
                  .selectAll('path')
                  .data(adminFeatures)
                  .enter()
                  .append('path')
                  .attr('d', path)
                  .attr('fill', 'none')
                  .attr('stroke', adminStrokeColor);
              }
            })
            .catch((error) => {
              console.warn(
                `Unable to load administrative boundaries for ${countryName}:`,
                error,
              );
            })
            .finally(() => {
              // Draw cities and legend regardless of admin boundary data
              drawCitiesAndLegend(svg, cities, projection, path, width, height);
            });
        })
        .catch((error) => {
          console.error('Error loading or processing world map data:', error);
        });
    } else if (selection === 'EachState') {
      // Load the US states map data
      d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
        .then((usData) => {
          const states = feature(usData, usData.objects.states).features;
          // Map of state names to IDs
          const stateNameToId = {
            Alabama: '01',
            Alaska: '02',
            Arizona: '04',
            Arkansas: '05',
            California: '06',
            Colorado: '08',
            Connecticut: '09',
            Delaware: '10',
            Florida: '12',
            Georgia: '13',
            Hawaii: '15',
            Idaho: '16',
            Illinois: '17',
            Indiana: '18',
            Iowa: '19',
            Kansas: '20',
            Kentucky: '21',
            Louisiana: '22',
            Maine: '23',
            Maryland: '24',
            Massachusetts: '25',
            Michigan: '26',
            Minnesota: '27',
            Mississippi: '28',
            Missouri: '29',
            Montana: '30',
            Nebraska: '31',
            Nevada: '32',
            'New Hampshire': '33',
            'New Jersey': '34',
            'New Mexico': '35',
            'New York': '36',
            'North Carolina': '37',
            'North Dakota': '38',
            Ohio: '39',
            Oklahoma: '40',
            Oregon: '41',
            Pennsylvania: '42',
            'Rhode Island': '44',
            'South Carolina': '45',
            'South Dakota': '46',
            Tennessee: '47',
            Texas: '48',
            Utah: '49',
            Vermont: '50',
            Virginia: '51',
            Washington: '53',
            'West Virginia': '54',
            Wisconsin: '55',
            Wyoming: '56',
          };

          const stateId = stateNameToId[countryName];
          if (!stateId) {
            console.error(`State not found: ${countryName}`);
            return;
          }

          const stateData = states.find((d) => d.id === stateId);
          if (!stateData) {
            console.error(`State data not found: ${countryName}`);
            return;
          }
          // console.log(stateData)
          const projection = d3
            .geoAlbersUsa()
            .fitSize([width, height * 0.9], stateData);
          const path = d3.geoPath().projection(projection);

          // Draw the state
          svg
            .append('path')
            .datum(stateData)
            .attr('d', path)
            .attr('fill', countryFillColor)
            .attr('stroke', countryStrokeColor);

          // Draw cities and legend
          drawCitiesAndLegend(svg, cities, projection, path, width, height);
        })
        .catch((error) => {
          console.error('Error loading or processing US map data:', error);
        });
    }
  }, [selection, countryName, cities, dimensions]);

  const drawCitiesAndLegend = (
    svg,
    cities,
    projection,
    path,
    width,
    height,
  ) => {
    // Define color scale for cities
    const colorScale = d3
      .scaleThreshold()
      .domain([750000, 1000000, 2500000, 5000000, 7500000, 10000000])
      .range([
        '#FF4500',
        '#FFA500',
        '#FFFF00',
        '#90EE90',
        '#008000',
        '#0000FF',
      ]);

    // Draw the cities
    svg
      .append('g')
      .attr('class', 'cities')
      .selectAll('circle')
      .data(cities)
      .enter()
      .append('circle')
      .attr('cx', (d) => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? coords[0] : null;
      })
      .attr('cy', (d) => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? coords[1] : null;
      })
      .attr('r', 6)
      .attr('fill', (d) => colorScale(d.population))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', '#ffcccb');
        d3.select(`#city-${d.name.replace(/\s+/g, '-')}`).classed(
          'highlight',
          true,
        );
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', colorScale(d.population));
        d3.select(`#city-${d.name.replace(/\s+/g, '-')}`).classed(
          'highlight',
          false,
        );
      })
      .append('title')
      .text((d) => `${d.name}: ${d.population.toLocaleString()}`);

    // Create Legend
    const legendData = [
      { color: '#FF4500', label: '≤ 749K' },
      { color: '#FFA500', label: '750K - 999K' },
      { color: '#FFFF00', label: '1M - 2.49M' },
      { color: '#90EE90', label: '2.5M - 4.99M' },
      { color: '#008000', label: '5M - 7.49M' },
      { color: '#0000FF', label: '≥ 7.5M' },
    ];

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(10, ${height * 0.95})`);

    const legendItem = legend
      .selectAll('g')
      .data(legendData)
      .enter()
      .append('g')
      .attr(
        'transform',
        (d, i) => `translate(${i * (width / legendData.length)}, 0)`,
      );

    legendItem
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', (d) => d.color);

    legendItem
      .append('text')
      .attr('x', 25)
      .attr('y', 15)
      .text((d) => d.label)
      .attr('font-size', '12px');
  };

  return (
    <div ref={containerRef} style={{ height: '60vh', width: '100%' }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default PopulationMap;
