import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <h3>MENU</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>
          <div className="sidebar-link disabled-link">
            User Management
          </div>
        </li>
        <li>
          <div className="sidebar-link disabled-link">
            Locker Management
          </div>
        </li>
        <li>
          <NavLink 
            to="/activity-log" 
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active-link' : ''}`
            }
          >
            Transaction History
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
