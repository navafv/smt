import { useState, useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(creds.username, creds.password);
      navigate('/');
    } catch {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-96 rounded-xl bg-white p-8 shadow-2xl border border-gray-100"
      >
        <h2 className="mb-6 text-3xl font-bold text-green-600">
          SMT Admin Login
        </h2>
        <input
          type="text"
          placeholder="Username"
          className="mb-4 w-full rounded-lg border p-3 outline-hidden ring-green-500 focus:ring-2"
          onChange={(e) => setCreds({ ...creds, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-lg border p-3 outline-hidden ring-green-500 focus:ring-2"
          onChange={(e) => setCreds({ ...creds, password: e.target.value })}
        />
        <button className="w-full rounded-lg bg-green-600 py-3 font-bold text-white transition-colors hover:bg-green-700">
          Login
        </button>
      </form>
    </div>
  );
}
