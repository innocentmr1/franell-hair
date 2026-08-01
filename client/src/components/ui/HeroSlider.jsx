import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlider({ slides = [] }) {
  const images = slides
    .map((s) => s.imageUrl)
    .filter((url) => url && !url.startsWith('http://localhost'))
    .map(resolveUrl);

  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);
  const timer = useRef(null);

  const goTo = (next) => {
    if (images.length < 2) return;
    setFade(false);
    setTimeout(() => {
      setIdx((next + images.length) % images.length);
      setFade(true);
    }, 300);
  };

  const startTimer = () => {
    clearInterval(timer.current);
    if (images.length < 2) return;
    timer.current = setInterval(() => goTo(idx + 1), 5000);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timer.current); }, [idx, images.length]);

  function resolveUrl(url) {
    if (url.startsWith('/uploads/')) {
      const raw = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const base = raw.endsWith('/api') ? raw.slice(0, -4) : raw;
      return base ? `${base}${url}` : url;
    }
    return url;
  }

  if (!images.length) return <div className="hero-slider" />;

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
