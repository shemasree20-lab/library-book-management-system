import React, { useState, useEffect } from "react";
import { 
  BookMarked, CheckCircle2, Clock, Search, Filter, 
  RotateCcw, AlertCircle, User, BookOpen 
} from "lucide-react";
import { api } from "../api/client";

export default function BorrowingList() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [returningId, setReturningId] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getAllBorrowings();
      setBorrowings(data);
    } catch (err) {
      setError(err.message || "Failed to load borrowings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleReturn = async (borrowing) => {
    if (borrowing.returned) return;
    try {
      setReturningId(borrowing.id);
      setError("");
      await api.returnBook(borrowing.id);
      setActionSuccess(`Book "${borrowing.book?.title || 'Book'}" marked as returned!`);
      // Update local state
      setBorrowings((prev) =>
        prev.map((b) => (b.id === borrowing.id ? { ...b, returned: true } : b))
      );
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to mark book as returned");
    } finally {
      setReturningId(null);
    }
  };

  // Filtered list
  const filteredBorrowings = borrowings.filter((b) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !b.returned) ||
      (statusFilter === "returned" && b.returned);

    const matchesSearch =
      searchQuery === "" ||
      (b.book?.title && b.book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.user?.username && b.user.username.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const total = borrowings.length;
  const activeCount = borrowings.filter((b) => !b.returned).length;
  const returnedCount = borrowings.filter((b) => b.returned).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <BookMarked size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Borrowing Management
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Administrator overview of all circulation records, active loans, and returns
            </p>
          </div>
        </div>

        {activeCount > 0 && (
          <button
            onClick={async () => {
              if (window.confirm("Mark all active loans as returned and restore catalog availability?")) {
                try {
                  await api.resetAllBooks();
                  setActionSuccess("All active books marked as returned and restored to available!");
                  fetchBorrowings();
                  setTimeout(() => setActionSuccess(""), 4000);
                } catch (e) {
                  setError(e.message || "Failed to reset borrowings");
                }
              }
            }}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={15} />
            <span>Mark All as Returned</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#6ee7b7",
          fontSize: "0.9rem",
          marginBottom: 20
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{actionSuccess}</span>
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
          marginBottom: 20
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 28
      }}>
        <div className="glass-panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Total Circulation
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
            {total}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Active Loans
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>
            {activeCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Completed Returns
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>
            {returnedCount}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <Search size={16} style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)"
          }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 40 }}
            placeholder="Search by book title or borrower username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-secondary"}`}
          >
            All ({total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`btn btn-sm ${statusFilter === "active" ? "btn-primary" : "btn-secondary"}`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("returned")}
            className={`btn btn-sm ${statusFilter === "returned" ? "btn-primary" : "btn-secondary"}`}
          >
            Returned ({returnedCount})
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
          <div className="pulse-dot" style={{ margin: "0 auto 14px auto", width: 12, height: 12, background: "var(--accent-primary)" }} />
          <p>Loading borrowing history...</p>
        </div>
      ) : filteredBorrowings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
          <BookMarked size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            No borrowing records found
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: 4 }}>
            Borrowing records will appear here as users check out books.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "rgba(255, 255, 255, 0.02)",
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-muted)"
                }}>
                  <th style={{ padding: "16px 20px" }}>ID</th>
                  <th style={{ padding: "16px 20px" }}>Book Details</th>
                  <th style={{ padding: "16px 20px" }}>Borrower</th>
                  <th style={{ padding: "16px 20px" }}>Borrow Date</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrowings.map((b) => (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "16px 20px", fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      #{b.id}
                    </td>

                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                        {b.book ? b.book.title : `Book #${b.book_id}`}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
                        {b.book ? b.book.author : "Unknown author"}
                      </div>
                    </td>

                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "rgba(99, 102, 241, 0.2)",
                          color: "var(--accent-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <User size={13} />
                        </div>
                        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {b.user ? b.user.username : `User #${b.user_id}`}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: "16px 20px", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                      {new Date(b.borrow_date).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    <td style={{ padding: "16px 20px" }}>
                      <span className={`badge ${b.returned ? "badge-returned" : "badge-borrowed"}`}>
                        <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                        {b.returned ? "Returned" : "Active"}
                      </span>
                    </td>

                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      {!b.returned ? (
                        <button
                          onClick={() => handleReturn(b)}
                          className="btn btn-success btn-sm"
                          disabled={returningId === b.id}
                        >
                          <RotateCcw size={14} />
                          <span>{returningId === b.id ? "Updating..." : "Mark as Returned"}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
