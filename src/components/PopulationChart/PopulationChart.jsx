import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './PopulationChart.css';

const PopulationChart = ({ data }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (
      data &&
      data.length > 0 &&
      dimensions.width > 0 &&
      dimensions.height > 0
    ) {
      drawChart(data);
    }
  }, [data, dimensions]);

  const drawChart = (data) => {
    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;

    const isMobile = window.innerWidth <= 768;
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background', 'white')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    data.forEach((d) => {
      d.year = +d.year;
      d.population = +d.population;
    });

    const xExtent = d3.extent(data, (d) => d.year);
    const yMax = d3.max(data, (d) => d.population);
    const yMin = d3.min(data, (d) => d.population);
    const yPadding = (yMax - yMin) * 0.05;
    const yDomain = [yMin - yPadding, yMax + yPadding];

    const x = d3.scaleLinear().domain(xExtent).range([0, width]);

    const y = d3.scaleLinear().domain(yDomain).range([height, 0]);

    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.population))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#20B2AA')
      .attr('stroke-width', 2)
      .attr('d', line);

    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    const xAxis = d3
      .axisBottom(x)
      .ticks(8)
      .tickSize(6)
      .tickPadding(8)
      .tickFormat(d3.format('d'));

    const xAxisGroup = svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('class', 'axis');

    xAxisGroup
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#86868B');

    xAxisGroup.selectAll('line').attr('stroke', '#000').attr('stroke-width', 2);

    xAxisGroup.select('.domain').attr('stroke', '#000').attr('stroke-width', 2);

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .text('YEAR');

    const yAxis = d3
      .axisLeft(y)
      .ticks(6)
      .tickSize(6)
      .tickPadding(8)
      .tickFormat((d) => {
        if (yMax >= 1e9) {
          return `${(d / 1e9).toFixed(1)}B`;
        } else if (yMax >= 1e6) {
          return `${(d / 1e6).toFixed(1)}M`;
        } else if (yMax >= 1e3) {
          return `${(d / 1e3).toFixed(1)}K`;
        }
        return d;
      });

    const yAxisGroup = svg.append('g').call(yAxis).attr('class', 'axis');

    yAxisGroup
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#86868B');

    yAxisGroup.selectAll('line').attr('stroke', '#000').attr('stroke-width', 2);

    yAxisGroup.select('.domain').attr('stroke', '#000').attr('stroke-width', 2);

    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -55)
      .text('POPULATION');

    const makeYGridlines = () => d3.axisLeft(y).ticks(6);

    svg
      .append('g')
      .attr('class', 'grid')
      .call(makeYGridlines().tickSize(-width).tickFormat(''));

    const currentYear = new Date().getFullYear();
    if (currentYear >= xExtent[0] && currentYear <= xExtent[1]) {
      svg
        .append('line')
        .attr('x1', x(currentYear))
        .attr('y1', 0)
        .attr('x2', x(currentYear))
        .attr('y2', height)
        .attr('stroke', '#E5E5EA')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4');

      const currentPopulationData = data.find((d) => d.year === currentYear);
      if (currentPopulationData) {
        svg
          .append('circle')
          .attr('cx', x(currentYear))
          .attr('cy', y(currentPopulationData.population))
          .attr('r', 4)
          .attr('class', 'pulsing-dot');
      }
    }

    const focus = svg.append('g').style('display', 'none');

    focus
      .append('line')
      .attr('id', 'focusLineX')
      .attr('class', 'focusLine')
      .style('stroke-dasharray', '4,4');

    focus
      .append('line')
      .attr('id', 'focusLineY')
      .attr('class', 'focusLine')
      .style('stroke-dasharray', '4,4');

    const infoBox = svg
      .append('g')
      .attr('class', 'infoBox')
      .style('display', 'none');

    const infoBoxWidth = 120;
    const infoBoxHeight = 50;
    const infoBoxPadding = 10;

    infoBox
      .append('rect')
      .attr('width', infoBoxWidth)
      .attr('height', infoBoxHeight)
      .attr('rx', 8)
      .attr('ry', 8);

    const infoYear = infoBox
      .append('text')
      .attr('x', infoBoxPadding)
      .attr('y', infoBoxPadding + 15)
      .attr('font-size', '12px');

    const infoPopulation = infoBox
      .append('text')
      .attr('x', infoBoxPadding)
      .attr('y', infoBoxPadding + 35)
      .attr('font-size', '12px');

    svg
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'white')
      .style('opacity', 0)
      .on('mouseover', () => {
        focus.style('display', null);
        infoBox.style('display', null);
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        infoBox.style('display', 'none');
      })
      .on('mousemove', function (event) {
        const bisect = d3.bisector((d) => d.year).left;
        const xPos = d3.pointer(event)[0];
        const x0 = x.invert(xPos);
        const i = bisect(data, x0, 1);
        const selectedData = data[i - 1];

        focus
          .select('#focusLineX')
          .attr('x1', x(selectedData.year))
          .attr('y1', y(selectedData.population))
          .attr('x2', x(selectedData.year))
          .attr('y2', height)
          .attr('stroke', '#FF4500')
          .attr('stroke-width', 1);

        focus
          .select('#focusLineY')
          .attr('x1', 0)
          .attr('y1', y(selectedData.population))
          .attr('x2', x(selectedData.year))
          .attr('y2', y(selectedData.population))
          .attr('stroke', '#98989D')
          .attr('stroke-width', 1);

        const infoBoxX = x(selectedData.year) + 15;
        const infoBoxY = y(selectedData.population) - infoBoxHeight / 2;

        infoBox.attr(
          'transform',
          `translate(${
            x(selectedData.year) + infoBoxWidth + 30 > width
              ? x(selectedData.year) - infoBoxWidth - 15
              : infoBoxX
          },${infoBoxY})`,
        );

        infoYear.text(`Year: ${selectedData.year}`);
        infoPopulation.text(`Pop: ${d3.format(',')(selectedData.population)}`);
      });
  };

  return (
    <div ref={containerRef} className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PopulationChart;
