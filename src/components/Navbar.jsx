import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          Whimsy Board
        </Link>
        {token ? (
          <div style={styles.links}>
            <Link to="/boards" style={styles.link}>
              Boards
            </Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.links}>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/signup" style={styles.link}>
              SignUp
            </Link>
            <Link to="/create-board" style={styles.link}>
              Create Board
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "#2d3748",
    color: "white",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "white",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
  },
  logoutBtn: {
    background: "#e53e3e",
    border: "none",
    padding: "0.5rem 1rem",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Navbar;
