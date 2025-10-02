import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "../assets/fbg.png";
import logo from "../assets/logo.png";
import moes from "../assets/MoES.png"


export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("https://incois-system.onrender.com/auth/authority/register", {
        name,
        email,
        organization,
        password,
      });

      if (res.status == 200) {
        navigate("/Dashboard"); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  className="min-h-screen flex items-center justify-center bg-cover bg-slate-100  "
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div>
            <img className="h-25 w-25 absolute top-5 left-3" src={logo} alt="" />
            <img className="w-25 h-25 absolute top-5 right-3" src={moes} alt="" />
            <p className="absolute flex flex-col top-8 left-29 text-[#1b1b1b] font-semibold text-3xl"><span>Indian National Centre for</span> <span>Ocean Information Services</span></p>
          </div>
      <div className="w-full max-w-md bg-white rounded shadow-md p-6">
        <h1 className="text-xl text-slate-800 font-semibold mb-4 text-center">Sign Up</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 mb-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-800 text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-slate-700 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block  text-slate-800 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full w-full text-slate-700 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your GOVT email"
              required
            />
          </div>

          <div>
            <label className="block text-slate-800 text-sm font-medium mb-1">Organization</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full w-full text-slate-700 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your organization"
              required
            />
          </div>

          <div>
            <label className="block text-slate-800 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-slate-700 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-slate-800 text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-slate-700 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-slate-700  bg-sky-600 text-white py-2 rounded hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 w-full text-slate-700 text-center text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-sky-600  hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
