import React, { useState, useContext } from "react";
import { AuthContext } from "../Components/Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // validation
  const validate = () => {
    let newErrors = {};

    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";

    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // 💾 save to localStorage
    const userData = {
      name: form.name,
      email: form.email,
      password: form.password,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    register(userData);

    navigate("/");
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-secondary mb-6">
          Create Account
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          <div>
            <label className="block text-sm text-secondary mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className={inputClass("name")}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-secondary mb-1">Email</label>
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
            <label className="block text-sm text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className={inputClass("password")}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm text-secondary mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className={inputClass("confirmPassword")}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primaryHover transition font-medium"
          >
            Sign Up
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-center text-secondary mt-6">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
