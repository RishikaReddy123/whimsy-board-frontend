import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../config.js";

const SaveToBoardModal = ({ pinId, onClose, onSuccess }) => {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/boards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched boards:", res.data.boards);
        setBoards(res.data.boards || []);
      } catch (err) {
        console.error("Failed to load boards:", err);
        toast.error("Could not fetch boards.");
      }
    };
    fetchBoards();
  }, [token]);

  const handleSave = async () => {
    if (!selectedBoard) return;
    try {
      await axios.post(
        `${API_URL}/api/pins/${pinId}/save`,
        { board: selectedBoard },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Pin saved to the board!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Failed to save pin:", err);
      toast.error("Could not save pin to board.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 rounded-xl w-80 shadow-xl space-y-4">
        <h3 className="text-lg font-semibold">Save to Board</h3>
        {boards.length === 0 ? (
          <p>No boards available</p>
        ) : (
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 rounded focus:outline-none"
          >
            <option value="">Select a board</option>
            {boards.map((board) => (
              <option key={board._id} value={board._id}>
                {board.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedBoard}
            className="bg-gray-800 text-white px-4 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveToBoardModal;
