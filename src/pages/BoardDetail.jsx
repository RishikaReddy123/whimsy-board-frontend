import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [pins, setPins] = useState([]);
  const [newPin, setNewPin] = useState({ title: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);
  const [editPinId, setEditPinId] = useState(null);
  const [editData, setEditData] = useState({ title: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const [boardRes, pinsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/boards/${boardId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/pins/board/${boardId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setBoard(boardRes.data.board);
        setPins(pinsRes.data);
        setLoading(false);
      } catch (error) {
        alert("Unable to fetch Board data!");
        console.error(error);
      }
    };

    fetchBoardData();
  }, [boardId]);

  const handlePinChange = (e) =>
    setNewPin({ ...newPin, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_preset");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/rishika-cloud/image/upload",
        formData
      );
      setNewPin((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (error) {
      alert("Image upload failed!");
      console.log(error.message);
    }
  };

  const handleAddPin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/pins`,
        { ...newPin, board: boardId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const addedPin = res.data.pin;
      setPins((prev) => [...prev, addedPin]);
      setNewPin({ title: "", imageUrl: "" });
      setEditPinId(null);
    } catch (error) {
      alert("Failed to add pin!");
      console.error(error);
    }
  };

  const handleEditClick = (pin) => {
    setEditPinId(pin._id);
    setEditData({ title: pin.title });
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUpdatePin = async (pinId) => {
    try {
      await axios.patch(`http://localhost:5000/api/pins/${pinId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPins((prevPins) =>
        prevPins.map((pin) =>
          pin._id === pinId ? { ...pin, title: editData.title } : pin
        )
      );
      setEditPinId(null);
    } catch (error) {
      alert("Failed to edit!");
      console.error(error);
    }
  };

  const handleDeletePin = async (pinId) => {
    try {
      await axios.delete(`http://localhost:5000/api/pins/${pinId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPins((prev) => prev.filter((pin) => pin._id !== pinId));
    } catch (error) {
      alert("Error deleting Pin!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10 text-center text-gray-500">
        Loading board...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-white text-gray-800">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-1">{board.name}</h2>
        <p className="mb-6 text-sm text-gray-500">{board.description}</p>

        {/* Add Pin Form */}
        <form
          onSubmit={handleAddPin}
          className="flex flex-col sm:flex-row items-center gap-4 mb-8"
        >
          <input
            type="text"
            name="title"
            placeholder="Pin title"
            value={newPin.title}
            onChange={handlePinChange}
            className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full sm:w-1/3"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
          />
          <button
            type="submit"
            disabled={!newPin.title || !newPin.imageUrl}
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Add Pin
          </button>
        </form>

        {/* Pins Section */}
        <h3 className="text-lg font-medium mb-4">Your Pins</h3>

        {pins.length === 0 ? (
          <p className="text-gray-500">No pins yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pins.map((pin) => (
              <li
                key={pin._id}
                className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                {editPinId === pin._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
                        onClick={() => handleUpdatePin(pin._id)}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-600 text-sm"
                        onClick={() => setEditPinId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-medium">{pin.title}</p>
                    {pin.imageUrl && (
                      <img
                        src={pin.imageUrl}
                        alt={pin.title || "Pin image"}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    )}
                    <div className="flex justify-between text-sm">
                      <button
                        className="text-gray-700 hover:underline"
                        onClick={() => handleEditClick(pin)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => handleDeletePin(pin._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
