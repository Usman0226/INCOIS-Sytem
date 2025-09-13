import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import SignUp from "./components/SignUp";
import HazardDashboard from "./components/HazardDashboard";

function App() {
  const [scientist, setScientist] = useState(null);

  const handleLogin = (scientistData) => {
    setScientist(scientistData);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            scientist ? (
              <HazardDashboard scientist={scientist} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Dashboard" 
          element={
            scientist ? (
              <HazardDashboard scientist={scientist} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />

      </Routes>
    </Router>
  );
}

export default App;
