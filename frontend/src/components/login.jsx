import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./loader";
import bg from "../assets/fbg.png";
import logo from "../assets/logo.png";
import moes from "../assets/MoES.png"

import axios from "axios";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/authority/login",
        {
          email,
          password,
        }
      );

      const { token, scientist, message } = res.data;

      if (res.status === 200 && token) {
        localStorage.setItem("token", token);
        onLogin(scientist);
        navigate("/Dashboard");
      } else {
        setError("Login failed. Try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-slate-100  "
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div>
        <img className="h-25 w-25 absolute top-5 left-3" src={logo} alt="" />
        <img className="w-25 h-25 absolute top-5 right-3" src={moes} alt="" />
        <p className="absolute flex flex-col top-8 left-29 text-[#1b1b1b] font-semibold text-3xl"><span>Indian National Centre for</span> <span>Ocean Information Services</span></p>
      </div>
      <div className="w-full max-w-md bg-white rounded shadow-md p-6">
        <h1 className="text-xl text-slate-800 font-semibold mb-4 text-center">
          Login
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 mb-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-[#1b1b1b] border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your GOVT email"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-[#1b1b1b] border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 rounded hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Demo: use <code>scientist.incois@gov.in</code> /{" "}
          <code>Pass@1234</code>
        </p>
        <p className="mt-4  text-center text-sm ">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-sky-700 hover:underline font-medium"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
