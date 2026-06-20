import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Settings, LogOut, ExternalLink, Ticket, Scissors, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',              label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/products',     label: 'Products',    icon: Package },
  { to: '/admin/orders',       label: 'Orders',      icon: ShoppingBag },
  { to: '/admin/categories',   label: 'Categories',  icon: Tag },
  { to: '/admin/promo-codes',  label: 'Promo Codes', icon: Ticket },
  { to: '/admin/saloons',      label: 'Salons',      icon: Scissors },
  { to: '/admin/messages',     label: 'Messages',    icon: MessageSquare },
  { to: '/admin/users',        label: 'Users',       icon: Users },
  { to: '/admin/settings',     label: 'Settings',    icon: Settings },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-name">Franell Hair</div>
          <div className="admin-sidebar-logo-sub">Admin Panel</div>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={15} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="admin-nav-link" style={{ marginBottom: '.5rem' }}>
            <ExternalLink size={15} /> View Store
          </a>
          <button onClick={handleLogout} className="admin-sidebar-signout">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-content">
        <div className="admin-topbar">
          <span className="admin-topbar-title">{title}</span>
          <span className="admin-topbar-user">Hi, {user?.name}</span>
        </div>
        <div className="admin-body">{children}</div>
      </div>
    </div>
  );
}
