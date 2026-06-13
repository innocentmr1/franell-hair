import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=1100&fit=crop&q=80';

export default function HeroSlider({ slides = [] }) {
  const images  = slides.length ? slides.map((s) => s.imageUrl) : [FALLBACK];
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

  const resolveUrl = (url) => {
    if (!url) return FALLBACK;
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div className="hero-slider">
      {images.map((img, i) => (
        <div
          key={i}
          className={`hero-slide ${i === idx ? (fade ? 'active' : 'exit') : ''}`}
          style={{ backgroundImage: `url(${resolveUrl(img)})` }}
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
