import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, KeyRound, User, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { api } from "../api/client";

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/books";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.login(username.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess(res.user);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px"
    }}>
      <div className="glass-panel" style={{
        width: "100%",
        maxWidth: 440,
        padding: "36px 32px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Ambient Top Glow */}
        <div style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 100,
          background: "radial-gradient(ellipse, rgba(99, 102, 241, 0.35) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            marginBottom: 16,
            boxShadow: "0 0 24px rgba(99, 102, 241, 0.45)"
          }}>
            <BookOpen size={28} />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: 6 }}>
            Sign in to access your Library Book Management account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#fca5a5",
            fontSize: "0.85rem",
            marginBottom: 20
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="username"
                type="text"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <KeyRound
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8, padding: "12px 16px" }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--border-subtle)",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: "0.76rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          }}>
            <Sparkles size={13} color="var(--accent-primary)" />
            Quick Demo Auto-Fill
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin", "admin123")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.78rem" }}
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("student", "student123")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.78rem" }}
            >
              Demo Student
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
