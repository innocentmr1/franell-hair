import { useEffect, useState } from 'react';
import { Eye, Users, CalendarDays, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getVisitStats } from '../../services/api';

function DailyViewsChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rev-chart">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const label = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <div key={d.date} className="rev-bar-col">
            <span className="rev-bar-label">{d.count}</span>
            <div className="rev-bar-track">
              <div className="rev-bar-fill" style={{ height: `${Math.max(pct, 2)}%` }} />
            </div>
            <span className="rev-bar-month">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminTraffic() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisitStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Traffic">
      <div className="page-loading"><div className="spinner" /></div>
    </AdminLayout>
  );

  const CARDS = [
    { label: 'Visits Today',           value: stats?.viewsToday        ?? 0, icon: CalendarDays, cls: 'gold' },
    { label: 'Visits This Week',       value: stats?.viewsThisWeek     ?? 0, icon: TrendingUp,   cls: 'blue' },
    { label: 'Unique Visitors (30d)',  value: stats?.uniqueVisitors30d ?? 0, icon: Users,         cls: 'purple' },
    { label: 'Total Visits (All Time)',value: stats?.totalViews        ?? 0, icon: Eye,           cls: 'green' },
  ];

  return (
    <AdminLayout title="Traffic">
      <div className="admin-stat-grid">
        {CARDS.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="admin-stat-card">
            <div className={`admin-stat-icon ${cls}`}><Icon size={20} /></div>
            <div>
              <div className="admin-stat-value">{value}</div>
              <div className="admin-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats?.dailyViews?.length > 0 && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div className="admin-card-header" style={{ padding: 0, marginBottom: '1rem', border: 'none' }}>
            <span className="admin-card-title">Visits — Last 14 Days</span>
          </div>
          <DailyViewsChart data={stats.dailyViews} />
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Top Pages (Last 30 Days)</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Page</th><th>Views</th></tr>
            </thead>
            <tbody>
              {stats?.topPages?.map((p) => (
                <tr key={p.path}>
                  <td>{p.path === '/' ? 'Home' : p.path}</td>
                  <td>{p.count}</td>
                </tr>
              ))}
              {!stats?.topPages?.length && (
                <tr><td colSpan={2} className="admin-empty">No visits recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
