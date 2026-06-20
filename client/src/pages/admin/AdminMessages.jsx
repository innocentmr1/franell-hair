import { useEffect, useState } from 'react';
import { Trash2, MailOpen } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetContactMsgs, adminMarkContactRead, adminDeleteContactMsg } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminMessages() {
  const [msgs, setMsgs] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const load = () => adminGetContactMsgs().then(({ data }) => setMsgs(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await adminMarkContactRead(id);
    setMsgs((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await adminDeleteContactMsg(id);
    toast.success('Deleted');
    setMsgs((prev) => prev.filter((m) => m._id !== id));
  };

  const toggle = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
    const msg = msgs.find((m) => m._id === id);
    if (msg && !msg.read) markRead(id);
  };

  const unread = msgs.filter((m) => !m.read).length;

  return (
    <AdminLayout title="Contact Messages">
      <div className="admin-page-hd">
        <span className="admin-page-title">
          Contact Messages ({msgs.length}){unread > 0 && <span className="admin-badge-unread">{unread} unread</span>}
        </span>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Subject</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {msgs.length === 0 ? (
                <tr><td colSpan={5} className="admin-empty">No messages yet</td></tr>
              ) : msgs.map((m) => (
                <>
                  <tr key={m._id} style={{ background: m.read ? '' : 'rgba(180,140,80,.06)', cursor: 'pointer' }}
                    onClick={() => toggle(m._id)}>
                    <td><strong style={{ fontWeight: m.read ? 400 : 700 }}>{m.name}</strong></td>
                    <td style={{ fontSize: '.8125rem' }}>{m.email}</td>
                    <td style={{ fontSize: '.8125rem' }}>{m.subject}</td>
                    <td style={{ fontSize: '.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '.4rem', padding: '.75rem .5rem' }}>
                      {!m.read && (
                        <button onClick={() => markRead(m._id)} className="admin-btn" title="Mark read">
                          <MailOpen size={12} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(m._id)} className="admin-btn admin-btn-delete">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                  {expanded === m._id && (
                    <tr key={`${m._id}-body`}>
                      <td colSpan={5} style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', fontSize: '.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {m.message}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
