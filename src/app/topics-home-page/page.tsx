// TopicsHome.jsx
'use client';
// disable eslint for this file
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './TopicsHomePage.css';
import {
  DataTopicTile,
  GREY_BAR_TITLES,
} from '@/app/data-topics-landing-page/page';
import DataService from '@/components/DataService'; // Adjust the import path as needed

const TopicsHome = () => {
  const [topics, setTopics] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopics() {
      try {
        // Fetch all topics
        const allTopics = await DataService.getTopicsList('Agriculture'); // Adjust category as needed

        // Shuffle and select topics
        const shuffledTopics = allTopics.sort(() => 0.5 - Math.random());
        const selectedTopics = shuffledTopics.slice(0, 24);

        // Fetch descriptions for each topic
        const topicsData: any = await Promise.all(
          selectedTopics.map(async (title: any) => {
            let description = '';
            try {
              const paragraphs: any = await DataService.getParagraphs(
                'Agriculture',
                title,
              );
              if (paragraphs && (paragraphs.Summary || paragraphs.summary)) {
                description = paragraphs.Summary || paragraphs.summary;
              } else {
                description = `View a full breakdown and current trends/projections for ${title}`;
              }
            } catch (err) {
              console.error(
                `Error fetching paragraphs for topic '${title}':`,
                err,
              );
              description = `View a full breakdown and current trends/projections for ${title}`;
            }
            return {
              title,
              text: description,
              url: `/Agriculture/${encodeURIComponent(title)}`, // Adjust category as needed
            };
          }),
        );

        setTopics(topicsData);

        // Fetch trending topics similarly if needed
        // For now, we'll reuse topicsData for trendingTopics
        setTrendingTopics(topicsData.slice(0, 4));
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopics();
  }, []);

  return (
    <div className="topics-home-page">
      <div className="topics-home-page--grey-bar">
        {GREY_BAR_TITLES.map((title, index) => (
          <p key={index}>{title}</p>
        ))}
      </div>
      <div style={{ marginTop: 80 }} />
      <h1 className="page-title-data-page">Agriculture</h1>
      <div style={{ marginTop: 80 }} />

      <div className="topics-home-page--content">
        {loading ? (
          <p>Loading topics...</p>
        ) : topics.length > 0 ? (
          topics.map((data: any, index: any) => (
            <DataTopicTile
              key={index}
              title={data.title}
              text={data.text}
              url={data.url}
              showLogo={false}
              showButton={true}
            />
          ))
        ) : (
          <p>No topics available.</p>
        )}
      </div>

      <div style={{ marginTop: 100 }} />

      <div className="topics-home-page--box">
        <h1>Browse Related Topics</h1>
        <div className="topics-home-page--tiles-wrapper">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic: any, index: any) => (
              <DataTopicTile
                key={index}
                title={topic.title}
                text={topic.text}
                url={topic.url}
                showLogo
                showButton={false}
              />
            ))
          ) : (
            <p>No related topics available.</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 100 }} />
    </div>
  );
};

export default TopicsHome;
