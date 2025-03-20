import React, { useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validateForm = () => {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email))
      validationErrors.email = "Valid email is required";
    if (password.length < 6)
      validationErrors.password = "Password must be at least 6 characters long";

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post("/api/v1/auth/forgot-password", {
        email,
        answer,
        newPassword: password,
      });
      if (res && res.data.success) {
        toast.success(res.data.message, {
          duration: 5000,
          icon: "🙏",
          style: {
            background: "green",
            color: "white",
          },
        });
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title="Forgot Password - Ecommerce App">
      <div className="form-container" style={{ minHeight: "90vh" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h4 className="title">FORGOT PASSWORD FORM</h4>
          <div className="mb-3" style={{ width: "100%" }}>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Enter Your Email"
              required
            />
            {errors.email && <small className="text-danger">{errors.email}</small>}
          </div>
          <div className="mb-3" style={{ width: "100%" }}>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-control"
              placeholder="Enter Your Answer"
              required
            />
          </div>
          <div className="mb-3" style={{ width: "100%" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Enter Your New Password"
              required
            />
            {errors.password && (
              <small className="text-danger">{errors.password}</small>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            Forgot Password
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
