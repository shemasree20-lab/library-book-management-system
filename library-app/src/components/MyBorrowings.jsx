import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookOpen, Clock, CheckCircle2, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { api } from "../api/client";

export default function MyBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [returningId, setReturningId] = useState(null);

  const fetchMyBorrowings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getMyBorrowings();
      setBorrowings(data);
    } catch (err) {
      setError(err.message || "Failed to load your borrowings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBorrowings();
  }, []);

  const handleReturn = async (borrowing) => {
    if (borrowing.returned) return;
    try {
      setReturningId(borrowing.id);
      setError("");
      await api.returnBook(borrowing.id);
      setSuccessMsg(`✓ "${borrowing.book?.title || 'Book'}" has been successfully returned! It is now Ready to Borrow again.`);
      
      // Update local state
      setBorrowings((prev) =>
        prev.map((b) => (b.id === borrowing.id ? { ...b, returned: true } : b))
      );
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to return book");
    } finally {
      setReturningId(null);
    }
  };

  const activeLoans = borrowings.filter((b) => !b.returned);
  const returnedLoans = borrowings.filter((b) => b.returned);

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 28
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <Bookmark size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              My Borrowing History
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Track all your currently borrowed books and returned library items
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {activeLoans.length > 0 && (
            <button
              onClick={async () => {
                try {
                  await api.returnAllMyBooks();
                  setSuccessMsg("✓ All your books have been returned successfully!");
                  fetchMyBorrowings();
                  setTimeout(() => setSuccessMsg(""), 5000);
                } catch (e) {
                  setError(e.message || "Failed to return all books");
                }
              }}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: "rgba(16, 185, 129, 0.4)", color: "#34d399" }}
            >
              <RotateCcw size={14} />
              <span>Return All My Books ({activeLoans.length})</span>
            </button>
          )}

          <Link to="/books" className="btn btn-primary btn-sm">
            <BookOpen size={15} />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          background: "rgba(16, 185, 129, 0.16)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "var(--radius-md)",
          color: "#6ee7b7",
          fontSize: "0.92rem",
          fontWeight: 500,
          marginBottom: 24,
          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.15)"
        }}>
          <CheckCircle2 size={20} style={{ flexShrink: 0, color: "#10b981" }} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#fca5a5",
          fontSize: "0.9rem",
          marginBottom: 24
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Active Loans
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>
            {activeLoans.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Returned Books
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>
            {returnedLoans.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Borrowed
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
            {borrowings.length}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
          <div className="pulse-dot" style={{ margin: "0 auto 14px auto", width: 12, height: 12, background: "var(--accent-primary)" }} />
          <p>Loading your loans...</p>
        </div>
      ) : borrowings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
          <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            No borrowings yet
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: 4, marginBottom: 20 }}>
            Explore our collection and borrow your first book today.
          </p>
          <Link to="/books" className="btn btn-primary btn-sm">
            <span>Explore Books</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {borrowings.map((b) => (
            <div
              key={b.id}
              className="glass-panel"
              style={{
                padding: "20px 24px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                border: "1px solid var(--border-subtle)",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: b.returned ? "rgba(56, 189, 248, 0.12)" : "rgba(251, 191, 36, 0.12)",
                  color: b.returned ? "#38bdf8" : "#fbbf24",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {b.returned ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                </div>

                <div>
                  <h3 style={{ fontSize: "1.02rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {b.book ? b.book.title : `Book #${b.book_id}`}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    Author: {b.book ? b.book.author : "Unknown"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Borrowed on
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 500, marginTop: 2 }}>
                    {new Date(b.borrow_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </div>
                </div>

                <span className={`badge ${b.returned ? "badge-returned" : "badge-borrowed"}`}>
                  <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                  {b.returned ? "Returned" : "Active Loan"}
                </span>

                {!b.returned && (
                  <button
                    onClick={() => handleReturn(b)}
                    className="btn btn-success btn-sm"
                    disabled={returningId === b.id}
                  >
                    <RotateCcw size={14} />
                    <span>{returningId === b.id ? "Returning..." : "Return Book"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
