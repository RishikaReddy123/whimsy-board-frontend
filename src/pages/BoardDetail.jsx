import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SaveToBoardModal from "../components/SaveToBoardModal.jsx";
import toast from "react-hot-toast";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [pins, setPins] = useState([]);
  const [newPin, setNewPin] = useState({
    title: "",
    imageUrl: "",
    description: "",
    caption: "",
    tags: "",
  });
  const [loading, setLoading] = useState(true);
  const [editPinId, setEditPinId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

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
        toast.error("Unable to fetch Board data!");
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
      toast.error("Image upload failed!");
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
      setNewPin({
        title: "",
        imageUrl: "",
        description: "",
        caption: "",
        tags: "",
      });
      setEditPinId(null);
    } catch (error) {
      toast.error("Failed to add pin!");
      console.error(error);
    }
  };

  const handleEditClick = (pin) => {
    setEditPinId(pin._id);
    setEditData({ title: pin.title, description: pin.description || "" });
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
          pin._id === pinId
            ? {
                ...pin,
                title: editData.title,
                description: editData.description,
              }
            : pin
        )
      );
      setEditPinId(null);
    } catch (error) {
      toast.error("Failed to edit!");
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
      toast.error("Error deleting Pin!");
    }
  };

  const handleSaveClick = (pinId) => {
    setSelectedPinId(pinId);
    setShowSaveModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
        Loading board...
      </div>
    );
  }

  const handleGenerateMetadata = async () => {
    if (!newPin.description.trim()) return toast.error("Enter a description!");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/generate-metadata",
        {
          description: newPin.description,
        }
      );
      const content = res.data.metadata;
      const captionMatch = content.match(
        /caption[:\-]?\s*["“]?(.+?)["”]?\s*(tags|$)/i
      );
      const tagsMatch = content.match(/#\w+/g);

      // setNewPin((prev) => ({
      //   ...prev,
      //   caption: captionMatch?.[1] || " ",
      //   tags: tagsMatch?.join(" ") || " ",
      // }));
      setNewPin((prev) => ({
        ...prev,
        caption: res.data.metadata.split("\n")[0],
        tags: res.data.metadata.split("\n").slice(1).join(" ").trim(),
      }));
      toast.success("Caption and tags generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Metadata!");
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-1">{board.name}</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {board.description}
        </p>

        {/* Add Pin Form */}
        <form
          onSubmit={handleAddPin}
          className="flex flex-wrap items-start gap-4 mb-8"
        >
          <input
            type="text"
            name="title"
            placeholder="Pin title"
            value={newPin.title}
            onChange={handlePinChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-4 py-2 rounded-md text-gray-800 dark:text-gray-100 w-full sm:w-1/3"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm w-full sm:w-auto"
          />

          <textarea
            name="description"
            rows="3"
            placeholder="Short Description"
            value={newPin.description}
            onChange={handlePinChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-4 py-2 rounded-md text-gray-800 dark:text-gray-100 w-full sm:w-1/2 resize-none"
          />

          <button
            type="button"
            onClick={handleGenerateMetadata}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Generate caption and tags
          </button>

          <input
            type="text"
            name="caption"
            placeholder="Caption"
            value={newPin.caption}
            onChange={handlePinChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-4 py-2 rounded-md text-gray-800 dark:text-gray-100 w-full sm:w-1/3"
          />

          <input
            type="text"
            name="tags"
            placeholder="Tags (space separated)"
            value={newPin.tags}
            onChange={handlePinChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-4 py-2 rounded-md text-gray-800 dark:text-gray-100 w-full sm:w-1/3"
          />

          <button
            type="submit"
            disabled={!newPin.title || !newPin.imageUrl}
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition w-full sm:w-auto"
          >
            Add Pin
          </button>
        </form>

        {/* Pins Section */}
        <h3 className="text-lg font-medium mb-4">Your Pins</h3>

        {pins.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No pins yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pins.map((pin) => (
              <li
                key={pin._id}
                className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800"
              >
                {editPinId === pin._id ? (
                  <div className="space-y-2">
                    Title:
                    <input
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                    Description:
                    <input
                      type="text"
                      name="description"
                      placeholder="Edit description"
                      value={editData.description}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1 rounded-md text-sm"
                        onClick={() => handleUpdatePin(pin._id)}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-600 dark:text-gray-400 text-sm"
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
                    {pin.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {pin.description}
                      </p>
                    )}

                    {pin.caption && (
                      <p className="italic text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {pin.caption}
                      </p>
                    )}

                    {pin.tags && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {pin.tags}
                      </p>
                    )}
                    <div className="flex justify-between text-sm">
                      <button
                        className="text-gray-700 dark:text-gray-300 hover:underline"
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
                      <button
                        onClick={() => {
                          handleSaveClick(pin._id);
                        }}
                        className="bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-1 rounded hover:bg-gray-700 dark:hover:bg-gray-200"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {showSaveModal && (
          <SaveToBoardModal
            pinId={selectedPinId}
            onClose={() => setShowSaveModal(false)}
            onSuccess={() => {
              toast.success("Pin saved to another board!");
              setShowSaveModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
