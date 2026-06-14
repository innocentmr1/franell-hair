import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACKS = [
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1600&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=1600&h=900&fit=crop&q=85',
  'https://images.unsplash.com/photo-1519699047748-de8e44f90ae4?w=1600&h=900&fit=crop&q=85',
];

export default function HeroSlider({ slides = [] }) {
  const raw    = slides.length ? slides.map((s) => s.imageUrl) : FALLBACKS;
  const images = raw.map(resolveUrl);

  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);
  const timer = useRef(null);

  const goTo = (next) => {
    setFade(false);
    setTimeout(() => {
      setIdx((next + images.length) % images.length);
      setFade(true);
    }, 300);
  };

  const startTimer = () => {
    clearInterval(timer.current);
    timer.current = setInterval(() => goTo(idx + 1), 5000);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timer.current); }, [idx, images.length]);

  function resolveUrl(url) {
    if (!url) return FALLBACKS[0];
    if (url.startsWith('http://localhost')) return FALLBACKS[0];
    if (url.startsWith('/uploads/')) {
      const raw = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const base = raw.endsWith('/api') ? raw.slice(0, -4) : raw;
      return base ? `${base}${url}` : url;
    }
    return url;
  }

  return (
    <div className="hero-slider">
      {images.map((img, i) => (
        <div
          key={i}
          className={`hero-slide ${i === idx ? (fade ? 'active' : 'exit') : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      <div className="hero-slider-gradient" />

      {images.length > 1 && (
        <>
          <button className="hero-slider-arrow left" onClick={() => { goTo(idx - 1); startTimer(); }}>
            <ChevronLeft size={22} />
          </button>
          <button className="hero-slider-arrow right" onClick={() => { goTo(idx + 1); startTimer(); }}>
            <ChevronRight size={22} />
          </button>

          <div className="hero-slider-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`hero-slider-dot ${i === idx ? 'active' : ''}`}
                onClick={() => { goTo(i); startTimer(); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
