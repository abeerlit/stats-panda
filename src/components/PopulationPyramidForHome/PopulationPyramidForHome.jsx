import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './PopulationPyramidForHome.css';

const PopulationPyramidForHome = () => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const data = [
      { ageGroup: '95+', malePercent: 0.2, femalePercent: 0.3 },
      { ageGroup: '90-94', malePercent: 0.3, femalePercent: 0.4 },
      { ageGroup: '85-89', malePercent: 0.4, femalePercent: 0.5 },
      { ageGroup: '80-84', malePercent: 0.6, femalePercent: 0.8 },
      { ageGroup: '75-79', malePercent: 0.8, femalePercent: 1.0 },
      { ageGroup: '70-74', malePercent: 1.2, femalePercent: 1.5 },
      { ageGroup: '65-69', malePercent: 1.7, femalePercent: 1.9 },
      { ageGroup: '60-64', malePercent: 2.0, femalePercent: 2.2 },
      { ageGroup: '55-59', malePercent: 2.5, femalePercent: 2.6 },
      { ageGroup: '50-54', malePercent: 2.8, femalePercent: 2.9 },
      { ageGroup: '45-49', malePercent: 3.0, femalePercent: 3.1 },
      { ageGroup: '40-44', malePercent: 3.3, femalePercent: 3.4 },
      { ageGroup: '35-39', malePercent: 3.5, femalePercent: 3.5 },
      { ageGroup: '30-34', malePercent: 3.8, femalePercent: 3.7 },
      { ageGroup: '25-29', malePercent: 3.9, femalePercent: 3.8 },
      { ageGroup: '20-24', malePercent: 3.9, femalePercent: 3.7 },
      { ageGroup: '15-19', malePercent: 4.1, femalePercent: 3.8 },
      { ageGroup: '10-14', malePercent: 4.2, femalePercent: 4.0 },
      { ageGroup: '5-9', malePercent: 4.4, femalePercent: 4.1 },
      { ageGroup: '0-4', malePercent: 4.5, femalePercent: 4.2 },
    ];

    const drawChart = () => {
      const svgElement = d3.select(svgRef.current);
      svgElement.selectAll('*').remove();

      const containerWidth = svgRef.current.parentNode.offsetWidth;
      const containerHeight = 550; // Adjusted height to ensure full text visibility

      const margin = { top: 20, right: 80, bottom: 60, left: 80 }; // Increased bottom margin for labels
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      const svg = svgElement
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .style('background-color', 'white') // Ensure SVG background is white
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Remove any existing tooltip to prevent duplicates
      d3.select('.tooltip').remove();

      // Create the tooltip div
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('box-shadow', '0 0 5px rgba(0, 0, 0, 0.3)')
        .style('z-index', '10000'); // Ensures tooltip is on top

      const maxPercent = 5;
      const xScaleMale = d3
        .scaleLinear()
        .domain([maxPercent, 0])
        .range([0, width / 2]);

      const xScaleFemale = d3
        .scaleLinear()
        .domain([0, maxPercent])
        .range([width / 2, width]);

      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.ageGroup))
        .range([0, height])
        .padding(0.1);

      // Function to adjust tooltip positioning to prevent overflow
      const adjustTooltipPosition = (event) => {
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;

        let left = event.pageX + 20;
        let top = event.pageY - 40;

        if (left + tooltipWidth > window.innerWidth) {
          left = event.pageX - tooltipWidth - 20;
        }
        if (top + tooltipHeight > window.innerHeight) {
          top = window.innerHeight - tooltipHeight - 10;
        } else if (top < 0) {
          top = 10;
        }

        tooltip.style('left', `${left}px`).style('top', `${top}px`);
      };

      // Male bars
      svg
        .selectAll('.bar-male')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar-male')
        .attr('x', (d) => xScaleMale(d.malePercent))
        .attr('y', (d) => yScale(d.ageGroup))
        .attr('width', (d) => width / 2 - xScaleMale(d.malePercent))
        .attr('height', yScale.bandwidth())
        .attr('fill', '#ADD8E6')
        .on('mouseover', function (event, d) {
          d3.select(this).attr('fill', '#87CEFA');
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'block';
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
          tooltip.innerHTML = `<strong>${`Age: ${d.ageGroup}<br>Male: ${d.malePercent}%`}</strong>`;
        })
        .on('mousemove', (event) => {
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
          adjustTooltipPosition(event);
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', '#ADD8E6');
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'none';
        });

      // Female bars
      svg
        .selectAll('.bar-female')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar-female')
        .attr('x', width / 2)
        .attr('y', (d) => yScale(d.ageGroup))
        .attr('width', (d) => xScaleFemale(d.femalePercent) - width / 2)
        .attr('height', yScale.bandwidth())
        .attr('fill', '#FFB6C1')
        .on('mouseover', function (event, d) {
          d3.select(this).attr('fill', '#FF69B4');
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'block';
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
          tooltip.innerHTML = `<strong>${`Age: ${d.ageGroup}<br>Female: ${d.malePercent}%`}</strong>`;
        })
        .on('mousemove', (event) => {
          adjustTooltipPosition(event);
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', '#FFB6C1');
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'none';
        });

      // Add axes
      const xAxisMale = d3
        .axisBottom(xScaleMale)
        .ticks(5)
        .tickFormat((d) => `${Math.abs(d)}%`);

      const xAxisFemale = d3
        .axisBottom(xScaleFemale)
        .ticks(5)
        .tickFormat((d) => `${d}%`);

      const yAxis = d3.axisLeft(yScale);

      svg
        .append('g')
        .attr('class', 'x-axis male-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxisMale);

      svg
        .append('g')
        .attr('class', 'x-axis female-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxisFemale);

      svg.append('g').attr('class', 'y-axis').call(yAxis);

      // Add labels for gender
      svg
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 4)
        .attr('y', height + 50) // Increased to ensure it's fully visible
        .attr('text-anchor', 'middle')
        .text('MALE');

      svg
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', (3 * width) / 4)
        .attr('y', height + 50) // Increased to ensure it's fully visible
        .attr('text-anchor', 'middle')
        .text('FEMALE');
    };

    drawChart();
    window.addEventListener('resize', drawChart);
    return () => {
      window.removeEventListener('resize', drawChart);
      d3.select('.tooltip').remove();
    };
  }, []);

  return (
    <div
      className="population-pyramid-home"
      style={{ backgroundColor: 'white', padding: '1rem' }}
    >
      <svg
        ref={svgRef}
        className="w-full h-auto"
        style={{ backgroundColor: 'white' }}
      ></svg>
      <div ref={tooltipRef} className="tooltip-other"></div>
    </div>
  );
};

export default PopulationPyramidForHome;
