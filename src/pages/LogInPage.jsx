import React, { useState, useContext } from "react";
import { AuthContext } from "../Components/Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function LogInPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};

    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
      storedUser &&
      storedUser.email === form.email &&
      storedUser.password === form.password
    ) {
      login(storedUser);
      navigate("/");
    } else {
      setErrors({ password: "Invalid email or password" });
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg outline-none transition
    ${
      errors[field]
        ? "border-red-500 focus:ring-2 focus:ring-red-400"
        : "border-gray-300 focus:ring-2 focus:ring-primary"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* BRAND */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="logo" className="h-14 mb-2" />
          <h2 className="text-2xl font-bold text-secondary">Welcome Back 👋</h2>
          <p className="text-sm text-gray-500">Sign in to continue shopping</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="text-sm text-secondary">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={inputClass("email")}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-secondary">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className={inputClass("password")}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* BUTTON */}
          <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryHover transition font-medium">
            Sign In
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-center text-secondary mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
