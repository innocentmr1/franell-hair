import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminStats } from '../../services/api';

const STATUS_CLASS = { pending:'gray', processing:'blue', shipped:'purple', delivered:'green', cancelled:'red' };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function RevenueChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="rev-chart">
      {data.map((d) => {
        const pct = (d.revenue / max) * 100;
        return (
          <div key={d.month} className="rev-bar-col">
            <span className="rev-bar-label">${d.revenue >= 1000 ? (d.revenue/1000).toFixed(1)+'k' : d.revenue.toFixed(0)}</span>
            <div className="rev-bar-track">
              <div className="rev-bar-fill" style={{ height: `${Math.max(pct, 2)}%` }} />
            </div>
            <span className="rev-bar-month">{MONTHS[(d.month - 1) % 12]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="page-loading"><div className="spinner" /></div>
    </AdminLayout>
  );

  const CARDS = [
    { label: 'Total Revenue',  value: `$${(stats?.revenue || 0).toFixed(2)}`, icon: DollarSign, cls: 'gold' },
    { label: 'Total Orders',   value: stats?.totalOrders   ?? 0,              icon: ShoppingBag, cls: 'blue' },
    { label: 'Total Products', value: stats?.totalProducts ?? 0,              icon: Package,    cls: 'purple' },
    { label: 'Customers',      value: stats?.totalUsers    ?? 0,              icon: Users,      cls: 'green' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
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

      {/* Recent orders */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Recent Orders</span>
          <Link to="/admin/orders" className="admin-card-action">View all →</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/admin/orders`} style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>${(o.totalPrice || o.total || 0).toFixed(2)}</td>
                  <td>
                    <span className={`admin-badge ${STATUS_CLASS[o.status] || 'gray'}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
              {!stats?.recentOrders?.length && (
                <tr><td colSpan={5} className="admin-empty">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue chart */}
      {stats?.monthlyRevenue?.length > 0 && (
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div className="admin-card-header" style={{ padding: 0, marginBottom: '1rem', border: 'none' }}>
            <span className="admin-card-title">Monthly Revenue</span>
          </div>
          <RevenueChart data={stats.monthlyRevenue} />
        </div>
      )}

      {/* Top products */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Top Selling Products</span>
          <Link to="/admin/products" className="admin-card-action">Manage →</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Sold</th><th>Stock</th></tr>
            </thead>
            <tbody>
              {stats?.topProducts?.map((p) => (
                <tr key={p._id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <img
                      src={p.images?.[0] || `https://placehold.co/40x40/111/C9A84C?text=H`}
                      alt={p.name}
                      className="admin-table-img"
                      onError={(e) => { e.target.src = 'https://placehold.co/40x40/111/C9A84C?text=H'; }}
                    />
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </td>
                  <td>{p.category}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.sold || 0}</td>
                  <td>{p.stock}</td>
                </tr>
              ))}
              {!stats?.topProducts?.length && (
                <tr><td colSpan={5} className="admin-empty">No products yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
