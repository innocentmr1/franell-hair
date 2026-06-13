import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetOrders, adminUpdateOrderStatus } from '../../services/api';
import { resolveImg } from '../../assets/images';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLE = {
  pending:    { color: '#92400e', bg: '#fef3c7' },
  processing: { color: '#1e40af', bg: '#dbeafe' },
  shipped:    { color: '#5b21b6', bg: '#ede9fe' },
  delivered:  { color: '#14532d', bg: '#dcfce7' },
  cancelled:  { color: '#991b1b', bg: '#fee2e2' },
};

function OrderDetail({ order }) {
  return (
    <div className="ao-detail">
      {/* Items */}
      <div className="ao-detail-section">
        <p className="ao-detail-heading">Items Ordered ({order.orderItems?.length})</p>
        <div className="ao-items">
          {order.orderItems?.map((item, i) => {
            const img = resolveImg(item.image);
            return (
              <div key={i} className="ao-item">
                {img
                  ? <img src={img} alt={item.name} className="ao-item-img" />
                  : <div className="ao-item-img ao-item-ph"><Package size={16} /></div>
                }
                <div className="ao-item-info">
                  <p className="ao-item-name">{item.name}</p>
                  <p className="ao-item-meta">
                    Qty: {item.qty}
                    {item.length && ` · ${item.length}"`}
                    {item.color  && ` · ${item.color}`}
                  </p>
                </div>
                <span className="ao-item-price">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping */}
      <div className="ao-detail-section">
        <p className="ao-detail-heading">Shipping Address</p>
        {order.shippingAddress ? (
          <div className="ao-address">
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress.zip}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '.8125rem' }}>No address on file</p>
        )}
      </div>

      {/* Payment */}
      <div className="ao-detail-section">
        <p className="ao-detail-heading">Payment</p>
        <div className="ao-payment">
          <div className="ao-pay-row"><span>Method</span><span>{order.paymentMethod || '—'}</span></div>
          <div className="ao-pay-row"><span>Paid</span>
            <span style={{ color: order.isPaid ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
              {order.isPaid ? `Yes — ${new Date(order.paidAt).toLocaleDateString()}` : 'No'}
            </span>
          </div>
          <div className="ao-pay-row"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
          <div className="ao-pay-row"><span>Shipping</span>
            <span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}</span>
          </div>
          <div className="ao-pay-row"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
          <div className="ao-pay-row ao-pay-total"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [filter, setFilter]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    adminGetOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await adminUpdateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <AdminLayout title="Orders">
      <div className="admin-page-hd">
        <span className="admin-page-title">Orders ({filtered.length})</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-filter-select">
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="admin-empty"><div className="spinner" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="admin-empty">No orders found</td></tr>
              ) : filtered.map((o) => {
                const s = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
                const isOpen = expanded === o._id;
                return (
                  <>
                    <tr key={o._id} className={isOpen ? 'ao-row-open' : ''}>
                      <td style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'monospace' }}>
                        #{o._id.slice(-8).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{o.user?.name || 'Guest'}</div>
                        <div style={{ fontSize: '.75rem', color: '#9ca3af' }}>{o.user?.email}</div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: '.8125rem' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ color: '#374151', fontSize: '.875rem' }}>
                        {o.orderItems?.length || 0} item{o.orderItems?.length !== 1 ? 's' : ''}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '.9375rem' }}>${(o.totalPrice || 0).toFixed(2)}</td>
                      <td>
                        <span style={{ background: s.bg, color: s.color, fontSize: '.6875rem', fontWeight: 700, padding: '.25rem .625rem', borderRadius: '9999px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatus(o._id, e.target.value)}
                          className="admin-status-select"
                        >
                          {STATUSES.slice(1).map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => toggle(o._id)}
                          className="ao-toggle-btn"
                          title={isOpen ? 'Hide details' : 'View details'}
                        >
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {isOpen ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={`${o._id}-detail`} className="ao-detail-row">
                        <td colSpan={8} style={{ padding: 0 }}>
                          <OrderDetail order={o} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
