import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAboutPage } from '../services/api';

const DEFAULT = {
  heroTitle: 'About Franell Hair',
  heroSub: 'Premium hair for every queen.',
  storyTag: 'Our Story',
  storyTitle: 'Born from passion, built for you',
  storyParagraph1: '',
  storyParagraph2: '',
  storyImage: '',
  valuesTitle: 'Why choose Franell?',
  values: [],
};

export default function AboutPage() {
  const [content, setContent] = useState(DEFAULT);

  useEffect(() => {
    getAboutPage().then(({ data }) => setContent(data)).catch(() => {});
  }, []);

  return (
    <div className="about-page">
      <div className="about-hero">
        <h1 className="about-hero-title">{content.heroTitle}</h1>
        <p className="about-hero-sub">{content.heroSub}</p>
      </div>

      <div className="about-body">
        <section className="about-section about-story">
          <div className="about-story-text">
            {content.storyTag && <p className="about-tag">{content.storyTag}</p>}
            <h2 className="about-section-title">{content.storyTitle}</h2>
            {content.storyParagraph1 && <p className="about-section-body">{content.storyParagraph1}</p>}
            {content.storyParagraph2 && <p className="about-section-body">{content.storyParagraph2}</p>}
            <Link to="/shop" className="about-cta-btn">Shop Now</Link>
          </div>
          {content.storyImage && (
            <div className="about-story-img">
              <img src={content.storyImage} alt="Franell Hair" />
            </div>
          )}
        </section>

        {content.values?.length > 0 && (
          <section className="about-values">
            <h2 className="about-section-title" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              {content.valuesTitle}
            </h2>
            <div className="about-values-grid">
              {content.values.map((v, i) => (
                <div key={i} className="about-value-card">
                  <div className="about-value-icon">{v.icon}</div>
                  <h3 className="about-value-title">{v.title}</h3>
                  <p className="about-value-body">{v.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
