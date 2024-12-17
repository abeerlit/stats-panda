// CountryMap.jsx

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

const CountryMap = ({ country, state, data, selectedField, isUSData }) => {
  console.log('CountryMap rendered with props:', {
    country,
    state,
    selectedField,
    isUSData,
  });
  console.log('Data received:', data);

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 150 });

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
      'Russian Federation': 'Russia',
    };
    return normalizationMap[name] || name;
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        console.log('Updating dimensions:', { width, height });
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    console.log('Rendering map effect triggered');
    console.log('Current dimensions:', dimensions);
    console.log('isUSData:', isUSData);
    console.log('country:', country);
    console.log('state:', state);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const uniformColor = '#FFA1A9';

    if (isUSData) {
      console.log('Rendering US map');
      d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
        .then((usData) => {
          console.log('US data loaded:', usData);
          const states = feature(usData, usData.objects.states).features;
          console.log('States features:', states);

          if (state) {
            console.log('Rendering specific state:', state);
            const selectedState = states.find(
              (d) => d.properties.name === state,
            );

            if (selectedState) {
              console.log('Selected state found:', selectedState);
              const projection = d3
                .geoAlbersUsa()
                .fitSize([dimensions.width, dimensions.height], selectedState);

              const path = d3.geoPath().projection(projection);

              svg
                .append('path')
                .datum(selectedState)
                .attr('d', path)
                .attr('fill', uniformColor)
                .attr('stroke', '#fff');

              const centroid = path.centroid(selectedState);
              svg
                .append('text')
                .attr('x', centroid[0])
                .attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .attr('fill', '#000')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text(state);
            } else {
              console.error(`State not found: ${state}`);
            }
          } else {
            console.log('Rendering entire US map');
            const projection = d3
              .geoAlbersUsa()
              .fitSize([dimensions.width, dimensions.height], {
                type: 'FeatureCollection',
                features: states,
              });

            const path = d3.geoPath().projection(projection);

            svg
              .append('g')
              .attr('class', 'states')
              .selectAll('path')
              .data(states)
              .join('path')
              .attr('d', path)
              .attr('fill', uniformColor)
              .attr('stroke', '#fff')
              .attr('stroke-width', 0.5);
          }
        })
        .catch((error) => {
          console.error('Error loading or processing US map data:', error);
        });
    } else {
      console.log('Rendering world map');
      d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then((worldData) => {
          console.log('World data loaded:', worldData);
          if (
            !worldData ||
            !worldData.objects ||
            !worldData.objects.countries
          ) {
            console.error('Invalid world data structure');
            return;
          }

          let countries;
          try {
            countries = feature(
              worldData,
              worldData.objects.countries,
            ).features.filter((d) => d.properties.name !== 'Antarctica');
            console.log('Countries features:', countries);
          } catch (error) {
            console.error('Error processing TopoJSON data:', error);
            return;
          }

          if (country) {
            console.log('Rendering specific country:', country);
            const normalizedCountryName = normalizeCountryName(country);
            const selectedCountry = countries.find(
              (d) =>
                normalizeCountryName(d.properties.name) ===
                normalizedCountryName,
            );

            if (selectedCountry) {
              console.log('Selected country found:', selectedCountry);
              const projection = d3
                .geoMercator()
                .fitSize(
                  [dimensions.width, dimensions.height],
                  selectedCountry,
                );

              const path = d3.geoPath().projection(projection);

              svg
                .append('path')
                .datum(selectedCountry)
                .attr('d', path)
                .attr('fill', uniformColor)
                .attr('stroke', '#fff');

              const centroid = path.centroid(selectedCountry);
              svg
                .append('text')
                .attr('x', centroid[0])
                .attr('y', centroid[1])
                .attr('text-anchor', 'middle')
                .attr('fill', '#000')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .text(country);
            } else {
              console.error(`Country not found: ${country}`);
            }
          } else {
            console.log('Rendering entire world map');
            const projection = d3
              .geoEquirectangular()
              .fitSize([dimensions.width, dimensions.height], {
                type: 'Sphere',
              });

            const path = d3.geoPath().projection(projection);

            svg
              .append('g')
              .attr('class', 'countries')
              .selectAll('path')
              .data(countries)
              .join('path')
              .attr('d', path)
              .attr('fill', uniformColor)
              .attr('stroke', '#fff')
              .attr('stroke-width', 0.5);
          }
        })
        .catch((error) => {
          console.error('Error loading or processing world map data:', error);
        });
    }
  }, [country, state, data, selectedField, dimensions, isUSData]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ backgroundColor: 'transparent' }}></svg>
    </div>
  );
};

export default CountryMap;
