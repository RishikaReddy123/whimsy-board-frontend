import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BoardCard = ({ board }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/board/${board._id}`);
  };
  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        cursor: "pointer",
        width: "220px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        transition: "transform 0.1s ease-in-out",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <h3 style={{ margin: "0 0 0.5rem" }}>{board.name}</h3>
      {board.description && (
        <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>
          {board.description}
        </p>
      )}
    </div>
  );
};

export default BoardCard;
