import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { BookmarkPlus, ArrowLeft, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";

export default function CreateBorrowingPage() {
  const [searchParams] = useSearchParams();
  const preselectedBookId = searchParams.get("bookId") || "";

  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(preselectedBookId);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await api.getBooks({ availableOnly: true });
        setAvailableBooks(data);
        if (!preselectedBookId && data.length > 0) {
          setSelectedBookId(data[0].id.toString());
        }
      } catch (err) {
        setError(err.message || "Failed to load available books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [preselectedBookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError("Please select a book to borrow");
      return;
    }

    try {
      setBorrowing(true);
      setError("");
      await api.borrowBook(Number(selectedBookId));
      setSuccess("Book borrowed successfully!");
      setTimeout(() => navigate("/borrowings/me"), 1200);
    } catch (err) {
      setError(err.message || "Failed to borrow book");
    } finally {
      setBorrowing(false);
    }
  };

  const currentSelectedBook = availableBooks.find((b) => b.id.toString() === selectedBookId.toString());

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: "36px 20px" }}>
      <Link
        to="/books"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.88rem",
          color: "var(--text-secondary)",
          marginBottom: 20
        }}
      >
        <ArrowLeft size={16} />
        Back to Book Catalog
      </Link>

      <div className="glass-panel" style={{ padding: "36px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <BookmarkPlus size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Borrow a Book
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Select an available title from our catalog to check out
            </p>
          </div>
        </div>

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
            fontSize: "0.88rem",
            marginBottom: 20
          }}>
            <AlertCircle size={18} />
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
            fontSize: "0.88rem",
            marginBottom: 20
          }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Loading available books...</p>
        ) : availableBooks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              There are currently no books available for borrowing.
            </p>
            <Link to="/books" className="btn btn-secondary btn-sm">
              Back to Catalog
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="select-book">
                Select Available Book *
              </label>
              <select
                id="select-book"
                className="form-input"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id} style={{ background: "#111827", color: "white" }}>
                    {book.title} — {book.author} ({book.genre})
                  </option>
                ))}
              </select>
            </div>

            {currentSelectedBook && (
              <div style={{
                margin: "20px 0",
                padding: "16px 20px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)"
              }}>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Selected Book Details
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {currentSelectedBook.title}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  By {currentSelectedBook.author} · Category: {currentSelectedBook.genre}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
              <Link to="/books" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={borrowing}>
                <BookmarkPlus size={17} />
                <span>{borrowing ? "Processing Loan..." : "Confirm & Borrow"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
