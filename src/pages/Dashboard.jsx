import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../config";

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBoard, setNewBoard] = useState({ name: "", description: "" });
  const [editingBoard, setEditingBoard] = useState(null);

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/boards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Boards fetched:", res.data);
      setBoards(Array.isArray(res.data.boards) ? res.data.boards : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching boards!", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleChange = (e) => {
    setNewBoard({ ...newBoard, [e.target.name]: e.target.value });
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/boards`, newBoard, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Board created successfully!");
    } catch (error) {
      toast.error("Error creating board!");
      console.error(error);
    }
    setNewBoard({ name: "", description: "" });
    fetchBoards();
  };

  const handleUpdateBoard = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`${API_URL}/api/boards/${editingBoard._id}`, newBoard, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Board updated successfully!");
      setNewBoard({ name: "", description: "" });
      setEditingBoard(null);
      fetchBoards();
    } catch (error) {
      toast.error("Error updating the board!");
      console.error(error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/api/boards/${boardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Board deleted.");
      fetchBoards();
    } catch (error) {
      toast.error("Error deleting board");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-12 px-4 sm:px-12">
      <h2 className="text-3xl font-semibold mb-2">
        Welcome to the Whimsy Board
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        This is your quiet creative space!
      </p>

      <form
        onSubmit={editingBoard ? handleUpdateBoard : handleCreateBoard}
        className="mb-8 space-y-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Board name"
          value={newBoard.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newBoard.description}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-200 transition"
          >
            {editingBoard ? "Update board" : "Create board"}
          </button>
          {editingBoard && (
            <button
              type="button"
              onClick={() => {
                setEditingBoard(null);
                setNewBoard({ name: "", description: "" });
              }}
              className="border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2 rounded transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">loading...</p>
      ) : boards.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">
          You don't have any boards yet!
        </p>
      ) : (
        <ul className="space-y-4">
          {boards.map((board) => (
            <li
              key={board._id}
              className="border border-gray-200 dark:border-gray-700 p-4 rounded hover:shadow-md transition bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-center">
                <Link
                  to={`/board/${board._id}`}
                  className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:underline"
                >
                  <strong>{board.name}</strong>
                </Link>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingBoard(board);
                      setNewBoard({
                        name: board.name,
                        description: board.description,
                      });
                    }}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBoard(board._id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {board.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {board.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
