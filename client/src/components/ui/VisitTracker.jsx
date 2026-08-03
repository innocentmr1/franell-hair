import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recordVisit } from '../../services/api';

function getVisitorId() {
  let id = localStorage.getItem('franellVisitorId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('franellVisitorId', id);
  }
  return id;
}

export default function VisitTracker() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin) return;
    if (pathname.startsWith('/admin')) return;
    recordVisit({ path: pathname, visitorId: getVisitorId() }).catch(() => {});
  }, [pathname, user]);

  return null;
}
