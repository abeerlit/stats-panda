// PopulationPyramid.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const computeData = (data, currentPopulation) => {
  // **Process data to merge age groups**
  const groupedAgeGroups = {
    '90+': ['90+'],
    '85-89': ['85-89'],
    '80-84': ['80-84'],
    '75-79': ['75-79'],
    '70-74': ['70-74'],
    '65-69': ['65-69'],
    '60-64': ['60-64'],
    '55-59': ['55-59'],
    '50-54': ['50-54'],
    '45-49': ['45-49'],
    '40-44': ['40-44'],
    '35-39': ['35-39'],
    '30-34': ['30-34'],
    '25-29': ['25-29'],
    '20-24': ['20-24'],
    '15-19': ['15-17', '18-19'],
    '10-14': ['10-14'],
    '5-9': ['5-9'],
    '0-4': ['0-1', '1-4'],
  };

  const groupedData = [];

  for (const [newAgeGroup, oldAgeGroups] of Object.entries(groupedAgeGroups)) {
    let malePercent = 0;
    let femalePercent = 0;

    oldAgeGroups.forEach((ageGroup) => {
      const ageData = data.find((d) => d.ageGroup === ageGroup);
      if (ageData) {
        malePercent += (ageData.malePopulation / currentPopulation) * 100;
        femalePercent += (ageData.femalePopulation / currentPopulation) * 100;
      }
    });

    groupedData.push({
      ageGroup: newAgeGroup,
      malePercent,
      femalePercent,
    });
  }
  return groupedData;
};

const PopulationPyramid = ({ inputData, currentPopulation }) => {
  const svgRef = useRef();
  const data = computeData(inputData, currentPopulation);

  useEffect(() => {
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
          tooltip
            .html(`Age: ${d.ageGroup}<br>Male: ${d.malePercent}%`)
            .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
          adjustTooltipPosition(event);
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', '#ADD8E6');
          tooltip.style('visibility', 'hidden');
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
          tooltip
            .html(`Age: ${d.ageGroup}<br>Female: ${d.femalePercent}%`)
            .style('visibility', 'visible');
        })
        .on('mousemove', (event) => {
          adjustTooltipPosition(event);
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', '#FFB6C1');
          tooltip.style('visibility', 'hidden');
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
  }, [data]);

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
    </div>
  );
};

export default PopulationPyramid;
