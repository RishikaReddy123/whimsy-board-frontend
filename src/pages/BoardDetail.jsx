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
  const [editData, setEditData] = useState({ title: "", imageUrl: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const fetchBoardData = async () => {
    try {
      const boardRes = await axios.get(
        `http://localhost:5000/api/boards/${boardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const pinsRes = await axios.get(
        `http://localhost:5000/api/pins/board/${boardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBoard(boardRes.data.board);
      setPins(pinsRes.data);
      setLoading(false);
    } catch (error) {
      alert("Unable to fetch Board data!");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  const handlePinChange = (e) => {
    setNewPin({ ...newPin, [e.target.name]: e.target.value });
  };

  const handleAddPin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/pins`,
        { ...newPin, board: boardId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewPin({ title: "", imageUrl: "" });
      fetchBoardData();
    } catch (error) {
      alert("Failed to add pin!");
      console.error(error);
    }
  };

  const handleDeletePin = async (pinId) => {
    try {
      await axios.delete(`http://localhost:5000/api/pins/${pinId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBoardData();
    } catch (error) {
      alert("Error deleting Pin!");
    }
  };

  const handleEditClick = (pin) => {
    setEditPinId(pin._id);
    setEditData({ title: pin.title });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdatePin = async (pinId) => {
    try {
      await axios.patch(`http://localhost:5000/api/pins/${pinId}`, editData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditPinId(null);
      fetchBoardData();
    } catch (error) {
      alert("Failed to edit!");
      console.error(error);
    }
  };

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

  return (
    <div>
      {loading ? (
        <p>Loading board...</p>
      ) : (
        <>
          <h2>{board.name}</h2>
          <p>{board.description}</p>
          <form onSubmit={handleAddPin}>
            <input
              type="text"
              name="title"
              placeholder="Pin title"
              value={newPin.title}
              onChange={handlePinChange}
              required
            />
            <input
              type="file"
              name="imageUrl"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <button type="submit" disabled={!newPin.title || !newPin.imageUrl}>
              Add Pin
            </button>
          </form>
          <h3>Your pins:</h3>
          {pins.length === 0 ? (
            <p>No pins yet!</p>
          ) : (
            <ul
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                listStyle: "none",
                padding: 0,
              }}
            >
              {pins.map((pin) => (
                <li
                  style={{
                    border: "1px solid #ccc",
                    padding: "1rem",
                    borderRadius: "10px",
                    width: "180px",
                    textAlign: "center",
                  }}
                  key={pin._id}
                >
                  {editPinId === pin._id ? (
                    <>
                      Title:
                      <input
                        type="text"
                        name="title"
                        value={editData.title}
                        onChange={handleEditChange}
                      />
                      {/* <input
                        type="text"
                        name="imageUrl"
                        value={editData.imageUrl}
                        onChange={handleEditChange}
                      /> */}
                      <button
                        disabled={loading}
                        onClick={() => handleUpdatePin(pin._id)}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditPinId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <strong>{pin.title}</strong>
                      {pin.imageUrl && (
                        <div>
                          <img
                            src={pin.imageUrl}
                            alt={pin.title}
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      )}
                      <button onClick={() => handleEditClick(pin)}>Edit</button>
                      <button
                        style={{
                          marginTop: "0.5rem",
                          background: "#f56565",
                          color: "#fff",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDeletePin(pin._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default BoardDetail;
