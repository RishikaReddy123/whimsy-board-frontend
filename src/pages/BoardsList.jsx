import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BoardCard from "../components/BoardCard";

const BoardsList = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBoards = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/boards", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched boards:", res.data);
        setBoards(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        alert("Failed to fetch boards!");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, [token, navigate]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your boards:</h2>
      {loading ? (
        <p>Loading...</p>
      ) : boards.length === 0 ? (
        <p>No boards available!</p>
      ) : (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {boards.map((board) => (
            <BoardCard key={board._id} board={board} />
          ))}
        </div>
      )}
      <Link
        style={{
          color: "white",
          textDecoration: "none",
          fontSize: "1rem",
        }}
        to="/create-board"
      >
        Create Board
      </Link>
    </div>
  );
};

export default BoardsList;
