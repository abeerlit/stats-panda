/* eslint-disable */
import React from 'react';
import './DataTopicsLandingPage.css';

export const DUMMY_DATA = {
  title: 'Pandemics',
  text: "Lorem Ipsum has been the industry's standard dummy text e",
};

const TITLES = [
  'Access to Energy',
  'Accountability & Transparency',
  'Alcohol Consumption',
  "Alzheimer's & Dementia",
  'Animal Welfare',
  'Antibiotics',
  'Artificial Intelligence',
  'Age Structure',
  'Agricultural Production',
];

export const GREY_BAR_TITLES = [
  'Criminal Justice',
  'Culture',
  'Demographics',
  'Economy',
  'Education',
  'Environment',
  'Military',
  'Geography',
  'Agriculture',
  'Health',
  'History',
  'Law',
];

const chunkArray = (inputArray: any, chunkSize: any) => {
  const result = [];
  for (let i = 0; i < inputArray?.length; i += chunkSize) {
    result.push(inputArray.slice(i, i + chunkSize));
  }
  return result;
};

const DataTopicsLandingPage = () => {
  const trendingTopics = [DUMMY_DATA, DUMMY_DATA, DUMMY_DATA, DUMMY_DATA];
  const chunkedArray = chunkArray(TITLES, 3);

  return (
    <div className="data-topics-landing-page">
      <div className="data-topics-landing-page--grey-bar">
        {GREY_BAR_TITLES.map((title, index) => {
          return <p key={index}>{title}</p>;
        })}
      </div>
      <div style={{ marginTop: 80 }} />
      <h1 className="page-title-data-page">Topics</h1>
      <h3 className="data-topics-landing-page--caption">
        Explore our ever-expanding topic categories
      </h3>
      <div className="data-topics-landing-page--box">
        <h1>Trending Topics This Month</h1>
        <div className="data-topics-landing-page--tiles-wrapper">
          {trendingTopics.map((topic, index) => (
            <DataTopicTile
              key={index}
              title={topic.title}
              text={topic.text}
              showLogo
            />
          ))}
        </div>
      </div>
      <div className="data-topics-landing-page--decorator" />

      <div style={{ marginTop: 100 }} />
      <div className="data-topics-landing-page--columns-wrapper">
        <div className="data-topics-landing-page--column">
          {trendingTopics.slice(0, 3).map((topic, index) => (
            <DataTopicTile
              key={index}
              title={topic.title}
              text={topic.text}
              showLogo
            />
          ))}
        </div>
        <div className="data-topics-landing-page--column">
          {trendingTopics.slice(0, 3).map((topic, index) => (
            <DataTopicTile
              key={index}
              title={topic.title}
              text={topic.text}
              showLogo
            />
          ))}
        </div>
        <div className="data-topics-landing-page--square">
          <view style={{ flex: 1 }} />
          <h3>Population and Demopgraphic Change</h3>
          <h4>Top 3</h4>
        </div>
      </div>
      <div style={{ marginTop: 100 }} />

      <div className="data-topics-landing-page--card">
        <div className="data-topics-landing-page--card-content">
          <p className="data-topics-landing-page--category">Education</p>
          <h3 className="data-topics-landing-page--title">
            Literacy Rate by Country
          </h3>
          <p className="data-topics-landing-page--description">
            Literacy, the ability to read and write, is an important issue
            facing the world today, as it promotes access to knowledge,
            information, and skills...
          </p>
        </div>
      </div>

      <div style={{ marginTop: 100 }} />
      {chunkedArray.map((chunk, index) => (
        <div
          key={index}
          className="data-topics-landing-page--topics-grid-container"
        >
          {chunk.map((title: any, index: any) => (
            <div key={index} className="data-topics-landing-page--topic-tile">
              <h3 className="data-topics-landing-page--topic-tile--title">
                {title}
              </h3>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: 100 }} />
    </div>
  );
};

export default DataTopicsLandingPage;

export const DataTopicTile = ({ title, text, showLogo, showButton }: any) => {
  return (
    <div className="data-topics-landing-page--tile">
      <h5>{title}</h5>
      <p>{text}</p>
      {showLogo && (
        <img
          src="/assets/SpLogoLong.png"
          alt="StatsPanda Logo"
          className="data-topics-landing-page--logo"
        />
      )}
      {showButton && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <p>View article</p>
          <img
            src="/assets/arrow-right.png"
            style={{ marginLeft: 5 }}
            width={16}
            height={16}
          />
        </div>
      )}
    </div>
  );
};
