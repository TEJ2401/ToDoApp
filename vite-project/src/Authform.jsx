/* eslint-disable react/prop-types */
import { React, useState, useEffect } from "react";
import "./Authform.css"; // Importing the CSS file

import { useLocation } from "react-router-dom";

function Authform({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();

  // Handle switching between login and register based on location state
  useEffect(() => {
    if (location.state?.fromRegister) {
      setIsLogin(false); // Direct to Register if redirected from registration
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      onLogin(email, password);
    } else {
      if (username.length < 3) {
        return;
      }
      onRegister(username, email, password);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="auth-input"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="auth-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="auth-input"
          />
          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need to register?" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
}

export default Authform;
