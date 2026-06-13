import { useEffect, useState } from 'react';
import { Trash2, ShieldCheck } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetUsers, adminDeleteUser } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetUsers()
      .then(({ data }) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove user "${name}"?`)) return;
    try {
      await adminDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const visible = search
    ? users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <AdminLayout title="Users">
      <div className="admin-page-hd">
        <span className="admin-page-title">Users ({visible.length})</span>
      </div>

      <div className="admin-search-row">
        <input
          type="text" placeholder="Search by name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="admin-empty"><div className="spinner" /></td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={5} className="admin-empty">No users found</td></tr>
              ) : visible.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: u.isAdmin ? 'rgba(201,168,76,.15)' : '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.8125rem', fontWeight: 700,
                        color: u.isAdmin ? 'var(--gold)' : '#6b7280',
                        flexShrink: 0,
                      }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{u.email}</td>
                  <td>
                    {u.isAdmin ? (
                      <span className="admin-badge gold" style={{ display: 'inline-flex', gap: '.3rem' }}>
                        <ShieldCheck size={11} /> Admin
                      </span>
                    ) : (
                      <span className="admin-badge gray">Customer</span>
                    )}
                  </td>
                  <td style={{ color: '#9ca3af' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {!u.isAdmin && (
                      <button onClick={() => handleDelete(u._id, u.name)} className="admin-btn admin-btn-delete">
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
