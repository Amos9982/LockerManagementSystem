import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="user-dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
        <div 
          className="user-info clickable" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <strong>{user.name || 'Guest'}</strong><br />
          Super Admin
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
