import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader() {
  const { pathname, search } = useLocation();
  const [visible, setVisible] = useState(false);
  const [fading, setFading]   = useState(false);
  const timers = useRef([]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    clear();
    setFading(false);
    setVisible(true);

    timers.current = [
      setTimeout(() => setFading(true),   500),
      setTimeout(() => setVisible(false), 800),
    ];

    return clear;
  }, [pathname, search]);

  if (!visible) return null;

  return (
    <div className={`page-loader-overlay ${fading ? 'fade-out' : ''}`}>
      <div className="page-loader-content">
        <div className="page-loader-ring">
          <div className="page-loader-ring-inner" />
        </div>
        <p className="page-loader-brand">Franell</p>
        <p className="page-loader-sub">Hair</p>
      </div>
    </div>
  );
}
