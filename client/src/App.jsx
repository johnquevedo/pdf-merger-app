import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import React, { useState, useEffect } from 'react';
import Home from './Home';
import Dashboard from './Dashboard';
import Header from './Header';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const authenticate = async (route) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    const res = await fetch(`http://localhost:3000/${route}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      return data.payload;
    }
    return null;
  };


  useEffect(() => {
    console.log("Use effect running.");
    (async () => {
      const data = await authenticate('dashboard');
      if (data) {
        setIsLoggedIn(true);
        setUserData(data);
      }
    })();
  }, []);

  return (
    <>
      <Header logged={isLoggedIn} logout={() => {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
        setUserData(null);
      }}/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard payload={userData}/> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!isLoggedIn ? <Login onLogin={async (username, password) => {
  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);

    const payload = await authenticate("dashboard");

    if (payload) {
      setUserData(payload);
      setIsLoggedIn(true);
    } else {
      alert("Authentication failed after login.");
    }
  } else {
    alert(data.message);
  }
}} />
 : <Navigate to="/dashboard"/>}
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
