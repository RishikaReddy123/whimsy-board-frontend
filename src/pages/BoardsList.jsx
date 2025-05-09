import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BoardCard from "../components/BoardCard";
import toast from "react-hot-toast";
import { API_URL } from "../config.js";

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
        const res = await axios.get(`${API_URL}/api/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBoards(Array.isArray(res.data.boards) ? res.data.boards : []);
      } catch (error) {
        toast.error("Failed to fetch boards!");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, [token, navigate]);

  return (
    <div className="min-h-screen px-6 py-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Boards</h2>
          <Link
            to="/create-board"
            className="text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Create Board
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        ) : boards.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No boards available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {boards.map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardsList;
