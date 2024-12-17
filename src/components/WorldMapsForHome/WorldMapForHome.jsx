// src/components/WorldMapForHome.jsx

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import './WorldMapForHome.css';

const WorldMapForHome = () => {
  const svgRef = useRef();
  const containerRef = useRef();
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Custom color palette
  const colorPalette = [
    '#FFF3E0',
    '#FFE0B2',
    '#FFCC80',
    '#FFB74D',
    '#FFA726',
    '#FF9800',
    '#FB8C00',
    '#F57C00',
    '#EF6C00',
    '#E65100',
  ];

  // Population data per country (as of 2023 estimates)
  const populationData = useMemo(
    () => ({
      Afghanistan: 41128771,
      Albania: 2837743,
      Algeria: 44903225,
      Andorra: 79824,
      Angola: 35027343,
      'Antigua and Barbuda': 99435,
      Argentina: 46010053,
      Armenia: 2963234,
      Australia: 26224554,
      Austria: 9094329,
      Azerbaijan: 10369510,
      Bahamas: 409984,
      Bahrain: 1738458,
      Bangladesh: 171675721,
      Barbados: 288023,
      Belarus: 9449323,
      Belgium: 11668278,
      Belize: 412190,
      Benin: 13250825,
      Bhutan: 787941,
      Bolivia: 12124464,
      'Bosnia and Herzegovina': 3257677,
      Botswana: 2420635,
      Brazil: 216422446,
      Brunei: 449002,
      Bulgaria: 6844597,
      'Burkina Faso': 22378940,
      Burundi: 13042921,
      Cambodia: 17312109,
      Cameroon: 27804593,
      Canada: 38388419,
      'Cape Verde': 593149,
      'Central African Republic': 5182077,
      Chad: 17541328,
      Chile: 19212362,
      China: 1424999420,
      Colombia: 51907020,
      Comoros: 907419,
      'Democratic Republic of the Congo': 97356050,
      'Republic of the Congo': 5898022,
      'Costa Rica': 5202542,
      "Cote d'Ivoire": 28404825,
      Croatia: 4053211,
      Cuba: 11325324,
      Cyprus: 1266675,
      'Czech Republic': 10692349,
      Denmark: 5894330,
      Djibouti: 1058454,
      Dominica: 72169,
      'Dominican Republic': 11148631,
      Ecuador: 18324921,
      Egypt: 106156692,
      'El Salvador': 6520674,
      'Equatorial Guinea': 1614868,
      Eritrea: 3681279,
      Estonia: 1315790,
      Eswatini: 1172023,
      Ethiopia: 122125417,
      Fiji: 909389,
      Finland: 5551412,
      France: 65212995,
      Gabon: 2381794,
      Gambia: 2554544,
      Georgia: 3971914,
      Germany: 83132799,
      Ghana: 33662103,
      Greece: 10300190,
      Greenland: 56770,
      Grenada: 124610,
      Guatemala: 18583273,
      Guinea: 13758966,
      'Guinea-Bissau': 2249386,
      Guyana: 808726,
      Haiti: 11674005,
      Honduras: 10120696,
      Hungary: 9643846,
      Iceland: 375318,
      India: 1428627510,
      Indonesia: 277534122,
      Iran: 87018450,
      Iraq: 43672028,
      Ireland: 5068035,
      Israel: 9216900,
      Italy: 59554023,
      Jamaica: 2981301,
      Japan: 123951692,
      Jordan: 11069972,
      Kazakhstan: 19389678,
      Kenya: 55504574,
      Kiribati: 121388,
      Kuwait: 4443812,
      Kyrgyzstan: 6760457,
      Laos: 7484673,
      Latvia: 1861159,
      Lebanon: 5621217,
      Lesotho: 2156186,
      Liberia: 5477801,
      Libya: 7099348,
      Liechtenstein: 38457,
      Lithuania: 2693430,
      Luxembourg: 654768,
      Madagascar: 29476808,
      Malawi: 20969051,
      Malaysia: 33640000,
      Maldives: 563844,
      Mali: 22364440,
      Malta: 533286,
      'Marshall Islands': 60032,
      Mauritania: 4949674,
      Mauritius: 1275970,
      Mexico: 132921094,
      Micronesia: 113131,
      Moldova: 2620235,
      Monaco: 39729,
      Mongolia: 3394174,
      Montenegro: 620145,
      Morocco: 37475916,
      Mozambique: 33031805,
      Myanmar: 55243471,
      Namibia: 2669266,
      Nauru: 10752,
      Nepal: 30431700,
      Netherlands: 17443873,
      'New Zealand': 5145428,
      Nicaragua: 6951839,
      Niger: 26301793,
      Nigeria: 225082083,
      'North Korea': 26295850,
      'North Macedonia': 2083374,
      Norway: 5556115,
      Oman: 5392173,
      Pakistan: 240485658,
      Palau: 18110,
      Panama: 4479466,
      'Papua New Guinea': 9583704,
      Paraguay: 7205834,
      Peru: 34139358,
      Philippines: 117337368,
      Poland: 37794323,
      Portugal: 10293552,
      Qatar: 2800177,
      Romania: 18631979,
      Russia: 144444359,
      Rwanda: 13856774,
      'Saint Kitts and Nevis': 53799,
      'Saint Lucia': 185158,
      'Saint Vincent and the Grenadines': 104332,
      Samoa: 221868,
      'San Marino': 33785,
      'Sao Tome and Principe': 232295,
      'Saudi Arabia': 36064493,
      Senegal: 18237994,
      Serbia: 8649142,
      Seychelles: 102070,
      'Sierra Leone': 8588625,
      Singapore: 5844369,
      Slovakia: 5458827,
      Slovenia: 2109701,
      'Solomon Islands': 739619,
      Somalia: 18190907,
      'South Africa': 60429620,
      'South Korea': 51624571,
      'South Sudan': 11423053,
      Spain: 47450795,
      'Sri Lanka': 21670000,
      Sudan: 47894606,
      Suriname: 623824,
      Sweden: 10353442,
      Switzerland: 8769944,
      Syria: 18747670,
      Taiwan: 23568378,
      Tajikistan: 9976344,
      Tanzania: 64411948,
      Thailand: 70273522,
      'Timor-Leste': 1402985,
      Togo: 8748245,
      Tonga: 106858,
      'Trinidad and Tobago': 1399128,
      Tunisia: 12052145,
      Turkey: 85864515,
      Turkmenistan: 6196524,
      Tuvalu: 11918,
      Uganda: 48923933,
      Ukraine: 41878565,
      'United Arab Emirates': 10101437,
      'United Kingdom': 67530172,
      'United States': 335942003,
      Uruguay: 3482309,
      Uzbekistan: 35189284,
      Vanuatu: 321832,
      Venezuela: 28887118,
      Vietnam: 99147017,
      Yemen: 32938284,
      Zambia: 20604086,
      Zimbabwe: 16036167,
    }),
    [],
  );

  const normalizeCountryName = (name) => {
    const normalizationMap = {
      'United States of America': 'United States',
      'Dem. Rep. Congo': 'Democratic Republic of the Congo',
      'Central African Rep.': 'Central African Republic',
      Czechia: 'Czech Republic',
      Congo: 'Republic of the Congo',
      Somaliland: 'Somalia',
      "Côte d'Ivoire": "Cote d'Ivoire",
      'S. Sudan': 'South Sudan',
      'Bosnia and Herz.': 'Bosnia and Herzegovina',
      'Myanmar (Burma)': 'Myanmar',
      'Syrian Arab Republic': 'Syria',
      'Lao PDR': 'Laos',
      'Viet Nam': 'Vietnam',
      Korea: 'North Korea',
      'Republic of Korea': 'South Korea',
      Swaziland: 'Eswatini',
      'French Southern and Antarctic Lands': 'France',
      Greenland: 'Greenland',
    };
    return normalizationMap[name] || name;
  };

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
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', '#FFFFFF');

    const g = svg.append('g');

    d3.json(
      'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    ).then((world) => {
      const countries = feature(world, world.objects.countries).features.filter(
        (d) => d.properties.name !== 'Antarctica',
      );

      const projection = d3
        .geoMercator()
        .fitSize([dimensions.width, dimensions.height], {
          type: 'FeatureCollection',
          features: countries,
        });

      const path = d3.geoPath().projection(projection);

      // Create a custom color scale
      const colorScale = d3
        .scaleThreshold()
        .domain([
          1_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000,
          200_000_000, 500_000_000, 1_000_000_000,
        ])
        .range(colorPalette);

      // Tooltip logic
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

      g.selectAll('path')
        .data(countries)
        .join('path')
        .attr('d', path)
        .attr('fill', (d) => {
          const countryName = normalizeCountryName(d.properties.name);
          const population = populationData[countryName];
          return population ? colorScale(population) : '#eee';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        // .on('mouseover', (event, d) => {
        //   const countryName = normalizeCountryName(d.properties.name);
        //   const population = populationData[countryName];
        //   if (population) {
        //     tooltip.html(`<strong>${countryName}</strong><br/>Population: ${population.toLocaleString()}`)
        //       .style('visibility', 'visible');
        //   }
        // })
        // .on('mousemove', (event) => {
        //   adjustTooltipPosition(event);
        // })
        // .on('mouseout', () => {
        //   tooltip.style('visibility', 'hidden');
        // })
        .on('mouseover', (event, d) => {
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'block';
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
          // tooltip.innerHTML = `<strong>${d.properties.name}</strong>`;
          const countryName = normalizeCountryName(d.properties.name);
          const population = populationData[countryName];
          if (population) {
            tooltip.innerHTML = `<strong>${countryName}</strong><br/>Population: ${population.toLocaleString()}`;
            // tooltip.html(`<strong>${countryName}</strong><br/>Population: ${population.toLocaleString()}`)
            //   .style('visibility', 'visible');
          }
        })
        .on('mousemove', (event) => {
          const tooltip = tooltipRef.current;
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
        })
        .on('mouseout', () => {
          const tooltip = tooltipRef.current;
          tooltip.style.display = 'none';
        });
    });

    svg.on('mouseleave', () => {
      tooltip.style('visibility', 'hidden');
    });
  }, [dimensions, populationData, colorPalette]);

  useEffect(() => {
    const handleScroll = () => {
      tooltip.style('visibility', 'hidden');
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const legendData = [
    { label: '<1M', range: '< 1 million' },
    { label: '1M-5M', range: '1-5 million' },
    { label: '5M-10M', range: '5-10 million' },
    { label: '10M-20M', range: '10-20 million' },
    { label: '20M-50M', range: '20-50 million' },
    { label: '50M-100M', range: '50-100 million' },
    { label: '100M-200M', range: '100-200 million' },
    { label: '200M-500M', range: '200-500 million' },
    { label: '500M-1B', range: '500M-1 billion' },
    { label: '>1B', range: '> 1 billion' },
  ];

  return (
    <div className="map-wrapper">
      <div
        ref={containerRef}
        className="world-map-container"
        style={{ width: '60vw', height: '60vh' }}
      >
        <svg ref={svgRef} width="100%" height="100%"></svg>
        <div ref={tooltipRef} className="tooltip-other"></div>
      </div>
      <div className="map-legend">
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
          Population Range
        </h3>
        <div className="legend-items">
          {legendData.map((item, index) => (
            <div key={index} className="legend-item" title={item.range}>
              <div
                className="legend-color"
                style={{ backgroundColor: colorPalette[index] }}
              ></div>
              <span className="legend-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorldMapForHome;
