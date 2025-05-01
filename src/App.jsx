import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BoardDetail from "./pages/BoardDetail";
import BoardsList from "./pages/BoardsList";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import CreateBoard from "./pages/CreateBoard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/boards"
            element={
              <PrivateRoute>
                <BoardsList />
              </PrivateRoute>
            }
          />

          <Route
            path="/board/:boardId"
            element={
              <PrivateRoute>
                <BoardDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-board"
            element={
              <PrivateRoute>
                <CreateBoard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
