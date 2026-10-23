import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, LogOut, User as UserIcon, PlusCircle, Bookmark, Shield, BookMarked } from "lucide-react";
import { getUser, clearAuth } from "../api/client";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = user || getUser();

  const handleLogout = () => {
    clearAuth();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(11, 15, 25, 0.8)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: "14px 24px"
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16
      }}>
        {/* Brand / Logo */}
        <Link to="/books" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 0 16px rgba(99, 102, 241, 0.5)"
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Library<span style={{ color: "var(--accent-primary)" }}>Hub</span>
            </span>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              Book Management
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {currentUser ? (
            <>
              <Link
                to="/books"
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: isActive("/books") ? "white" : "var(--text-secondary)",
                  background: isActive("/books") ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  border: isActive("/books") ? "1px solid var(--border-highlight)" : "1px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                <BookOpen size={16} />
                Books
              </Link>

              {currentUser.role === "admin" && (
                <>
                  <Link
                    to="/books/new"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: isActive("/books/new") ? "white" : "var(--text-secondary)",
                      background: isActive("/books/new") ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      border: isActive("/books/new") ? "1px solid var(--border-highlight)" : "1px solid transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    <PlusCircle size={16} />
                    Add Book
                  </Link>

                  <Link
                    to="/borrowings"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: isActive("/borrowings") ? "white" : "var(--text-secondary)",
                      background: isActive("/borrowings") ? "rgba(99, 102, 241, 0.2)" : "transparent",
                      border: isActive("/borrowings") ? "1px solid var(--border-highlight)" : "1px solid transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    <BookMarked size={16} />
                    All Borrowings
                  </Link>
                </>
              )}

              {currentUser.role === "user" && (
                <Link
                  to="/borrowings/me"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: isActive("/borrowings/me") ? "white" : "var(--text-secondary)",
                    background: isActive("/borrowings/me") ? "rgba(99, 102, 241, 0.2)" : "transparent",
                    border: isActive("/borrowings/me") ? "1px solid var(--border-highlight)" : "1px solid transparent",
                    transition: "all 0.2s"
                  }}
                >
                  <Bookmark size={16} />
                  My Borrowings
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: isActive("/login") ? "white" : "var(--text-secondary)",
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* User Info & Actions */}
        {currentUser && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)"
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: currentUser.role === "admin" ? "#a855f7" : "#0ea5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white"
              }}>
                {currentUser.role === "admin" ? <Shield size={14} /> : <UserIcon size={14} />}
              </div>
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {currentUser.username}
              </span>
              <span className={`badge badge-${currentUser.role === "admin" ? "admin" : "user"}`}>
                {currentUser.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
