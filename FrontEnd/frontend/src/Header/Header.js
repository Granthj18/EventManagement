import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/session", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.loggedIn) setUser(data.user);
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };
    checkSession();
  }, [setUser]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="header">
      <div className="left">
        <h1 className="logo" onClick={() => navigate("/")}>EventManager</h1>
      </div>

      <div className="center">
        <input
          type="text"
          className="search-box"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
        />
        <Link to="/create" className="nav-link">Create Event</Link>
      </div>
      <div className="right">
  {user ? (
    <>
      <button className="auth-button logout" onClick={handleLogout}>Logout</button>
      <Link to="/myevents" className="user-box">{user.name}</Link>

    </>
  ) : (
    <>
      <Link to="/login" className="auth-button">Login</Link>
      <Link to="/register" className="auth-button">Register</Link>
    </>
  )}
</div>


    </header>
  );
}

export default Header;
