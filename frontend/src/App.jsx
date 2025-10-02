import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignUp from "./components/SignUp.jsx";
import Login from "./components/login.jsx"
import HazardDashboard from "./components/HazardDashboard.jsx";

function App() {
  const [scientist, setScientist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = (scientistData) => {
    setScientist(scientistData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setScientist(null);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
        
          setScientist({ isAuthenticated: true });
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            scientist ? (
              <HazardDashboard scientist={scientist} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Dashboard" 
          element={
            scientist ? (
              <HazardDashboard scientist={scientist} onLogout={handleLogout} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />

      </Routes>
    </Router>
  );
}

export default App;
