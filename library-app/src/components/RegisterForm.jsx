import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, User, KeyRound, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";

export default function RegisterForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.register(username.trim(), password, role);
      setSuccess("Account registered successfully! Signing you in...");

      // Automatically log the newly registered user in
      setTimeout(async () => {
        try {
          const res = await api.login(username.trim(), password);
          if (onLoginSuccess) {
            onLoginSuccess(res.user);
          }
          navigate("/books", { replace: true });
        } catch {
          navigate("/login");
        }
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to create account. Username might already exist.");
    } finally {
      setLoading(false);
    }
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
        maxWidth: 460,
        padding: "36px 32px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 100,
          background: "radial-gradient(ellipse, rgba(16, 185, 129, 0.25) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            marginBottom: 16,
            boxShadow: "0 0 24px rgba(16, 185, 129, 0.4)"
          }}>
            <UserPlus size={28} />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Create Account
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: 6 }}>
            Join the library system as a Reader or an Administrator
          </p>
        </div>

        {/* Alerts */}
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

        {success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#6ee7b7",
            fontSize: "0.85rem",
            marginBottom: 20
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-username">
              Username
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="register-username"
                type="text"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="Choose a username"
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
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="register-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="Choose a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <div className="form-group">
            <label className="form-label">
              Role & Permissions
            </label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 4
            }}>
              <button
                type="button"
                onClick={() => setRole("user")}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: role === "user" ? "2px solid #38bdf8" : "1px solid var(--border-subtle)",
                  background: role === "user" ? "rgba(56, 189, 248, 0.12)" : "rgba(255, 255, 255, 0.03)",
                  color: "var(--text-primary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <User size={20} color={role === "user" ? "#38bdf8" : "var(--text-muted)"} />
                <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>User / Reader</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Borrow & read books</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: role === "admin" ? "2px solid #c084fc" : "1px solid var(--border-subtle)",
                  background: role === "admin" ? "rgba(192, 132, 252, 0.12)" : "rgba(255, 255, 255, 0.03)",
                  color: "var(--text-primary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <Shield size={20} color={role === "admin" ? "#c084fc" : "var(--text-muted)"} />
                <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>Administrator</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Manage all books</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 12, padding: "12px 16px" }}
            disabled={loading}
          >
            {loading ? (
              <span>Registering...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
