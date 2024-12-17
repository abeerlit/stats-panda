// EntityBarGraph.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EntityBarGraph = ({ data, field, currentEntity }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !field) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = svgRef.current.parentElement.offsetWidth;
    const containerHeight = 300; // Set desired height

    svg.attr('width', containerWidth).attr('height', containerHeight);

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const entitiesWithField = Object.entries(data)
      .filter(([entity, entityData]) => entityData[field] != null)
      .map(([entity, entityData]) => ({
        entity,
        value: parseFloat(entityData[field]),
      }))
      .sort((a, b) => a.value - b.value);

    // Scales
    const x = d3
      .scaleBand()
      .domain(entitiesWithField.map((d) => d.entity))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(entitiesWithField, (d) => d.value)])
      .nice()
      .range([height, 0]);

    // Color scale
    const colorScale = d3
      .scaleSequential(d3.interpolateOranges)
      .domain([0, d3.max(entitiesWithField, (d) => d.value)]);

    // Bars
    g.selectAll('.bar')
      .data(entitiesWithField)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.entity))
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.value))
      .attr('fill', (d) =>
        d.entity === currentEntity ? '#deee31' : colorScale(d.value),
      )
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', '#555');
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('fill', (d) =>
          d.entity === currentEntity ? '#ee5031' : colorScale(d.value),
        );
      })
      .append('title') // Tooltip
      .text((d) => `${d.entity}: ${d.value}`);
  }, [data, field, currentEntity]);

  return (
    <div style={{ width: '100%', overflowX: 'auto', textAlign: 'left' }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default EntityBarGraph;
