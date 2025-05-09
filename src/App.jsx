import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import BoardDetail from "./pages/BoardDetail";
import BoardsList from "./pages/BoardsList";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import CreateBoard from "./pages/CreateBoard";
import PrivateRoute from "./components/PrivateRoute";
import { useEffect, useState } from "react";

function App() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    localStorage.setItem("theme", "light");
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);
  return (
    <>
      <div className="min-h-screen bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <button
          onClick={() => setIsDark(!isDark)}
          className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded"
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Router>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
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
      </div>
    </>
  );
}

export default App;
