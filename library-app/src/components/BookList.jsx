import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, BookOpen, Plus, Edit2, Trash2, BookmarkPlus, 
  CheckCircle, AlertCircle, Filter, Book, Layers, Sparkles,
  RotateCcw, CheckCircle2, BookmarkCheck, ArrowRight, BookCheck
} from "lucide-react";
import { api, getUser } from "../api/client";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [myActiveBorrowings, setMyActiveBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [filterTab, setFilterTab] = useState("all"); // 'all', 'available', 'borrowed_by_me'

  // Action loading state
  const [actionBookId, setActionBookId] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const bookData = await api.getBooks({
        search: searchTerm,
        genre: selectedGenre,
      });
      setBooks(bookData);

      // If user is a student, fetch their active loans
      if (currentUser && currentUser.role !== "admin") {
        try {
          const borrowings = await api.getMyBorrowings();
          const activeLoanBookIds = borrowings
            .filter((b) => !b.returned)
            .map((b) => b.book_id);
          setMyActiveBorrowings(activeLoanBookIds);
        } catch {
          setMyActiveBorrowings([]);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre]);

  const handleBorrow = async (book) => {
    try {
      setActionBookId(book.id);
      setError("");
      await api.borrowBook(book.id);
      setSuccessMsg(`🎉 You have borrowed "${book.title}"! It is now added to your loans. You can return it anytime.`);
      
      // Update local state immediately
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, available: false } : b))
      );
      setMyActiveBorrowings((prev) => [...prev, book.id]);
      
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err) {
      setError(err.message || "Failed to borrow book");
    } finally {
      setActionBookId(null);
    }
  };

  const handleReturn = async (book) => {
    try {
      setActionBookId(book.id);
      setError("");
      await api.returnBookByBookId(book.id);
      setSuccessMsg(`✓ "${book.title}" was returned! It is now available to borrow again.`);

      // Update local state immediately
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, available: true } : b))
      );
      setMyActiveBorrowings((prev) => prev.filter((id) => id !== book.id));

      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to return book");
    } finally {
      setActionBookId(null);
    }
  };

  const handleReturnAllMyBooks = async () => {
    if (myActiveBorrowings.length === 0) {
      setSuccessMsg("You don't have any borrowed books right now.");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    try {
      setActionInProgress(true);
      setError("");
      await api.returnAllMyBooks();
      setSuccessMsg("✓ All your borrowed books have been returned and are ready to borrow again!");
      setMyActiveBorrowings([]);
      loadData();
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err) {
      setError(err.message || "Failed to return books");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResetAllBooks = async () => {
    if (!window.confirm("Make all books in the catalog Available and ready to borrow?")) {
      return;
    }
    try {
      setActionInProgress(true);
      setError("");
      await api.resetAllBooks();
      setSuccessMsg("✨ All books have been reset to Available!");
      setMyActiveBorrowings([]);
      loadData();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to reset books");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      return;
    }
    try {
      setError("");
      await api.deleteBook(book.id);
      setSuccessMsg(`Deleted "${book.title}" successfully`);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete book");
    }
  };

  // Compute genres dynamically
  const genres = ["All", ...new Set(books.map((b) => b.genre).filter(Boolean))];

  // Stats
  const totalBooks = books.length;
  const availableCount = books.filter((b) => b.available).length;
  const myBorrowedCount = myActiveBorrowings.length;
  const otherBorrowedCount = totalBooks - availableCount - myBorrowedCount;

  // Filter books according to tabs
  const displayedBooks = books.filter((book) => {
    if (filterTab === "available") return book.available;
    if (filterTab === "borrowed_by_me") return myActiveBorrowings.includes(book.id);
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      {/* Top Header */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: "1px solid var(--border-subtle)"
      }}>
        <div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Library Book Catalog
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginTop: 4 }}>
            {isAdmin 
              ? "Administrator Catalog Management: add, edit, or remove books" 
              : "Browse books, borrow anytime, and easily manage your loans"}
          </p>
        </div>

        {/* Quick Toolbar Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {!isAdmin && myActiveBorrowings.length > 0 && (
            <button
              onClick={handleReturnAllMyBooks}
              className="btn btn-secondary"
              style={{ borderColor: "rgba(16, 185, 129, 0.4)", color: "#34d399" }}
              disabled={actionInProgress}
            >
              <RotateCcw size={16} />
              <span>Return All My Books ({myActiveBorrowings.length})</span>
            </button>
          )}

          <button
            onClick={handleResetAllBooks}
            className="btn btn-secondary btn-sm"
            title="Reset catalog so all books are available"
            disabled={actionInProgress}
          >
            <RotateCcw size={14} />
            <span>Reset All to Available</span>
          </button>

          {isAdmin && (
            <Link to="/books/new" className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add New Book</span>
            </Link>
          )}
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
          border: "1px solid rgba(16, 185, 129, 0.45)",
          borderRadius: "var(--radius-md)",
          color: "#6ee7b7",
          fontSize: "0.92rem",
          fontWeight: 500,
          marginBottom: 20,
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
          background: "rgba(239, 68, 68, 0.14)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          borderRadius: "var(--radius-md)",
          color: "#fca5a5",
          fontSize: "0.9rem",
          marginBottom: 20
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 16,
        marginBottom: 24
      }}>
        <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(99, 102, 241, 0.15)",
            color: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Total Titles
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {totalBooks}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(16, 185, 129, 0.15)",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Ready to Borrow
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#34d399" }}>
              {availableCount}
            </div>
          </div>
        </div>

        {!isAdmin ? (
          <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(14, 165, 233, 0.15)",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <BookCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Borrowed by You
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#38bdf8" }}>
                {myBorrowedCount}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Book size={22} />
            </div>
            <div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Total On Loan
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#fbbf24" }}>
                {totalBooks - availableCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{
        padding: "16px 20px",
        marginBottom: 24,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16
      }}>
        {/* Search Input */}
        <div style={{ position: "relative", flex: "1 1 260px" }}>
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
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View Tabs */}
        <div style={{ display: "flex", gap: 6, background: "rgba(255, 255, 255, 0.04)", padding: 4, borderRadius: 10 }}>
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: "0.84rem",
              fontWeight: 600,
              background: filterTab === "all" ? "var(--accent-primary)" : "transparent",
              color: filterTab === "all" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.2s"
            }}
          >
            All Books ({totalBooks})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("available")}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: "0.84rem",
              fontWeight: 600,
              background: filterTab === "available" ? "#10b981" : "transparent",
              color: filterTab === "available" ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.2s"
            }}
          >
            Available Now ({availableCount})
          </button>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setFilterTab("borrowed_by_me")}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: "0.84rem",
                fontWeight: 600,
                background: filterTab === "borrowed_by_me" ? "#0ea5e9" : "transparent",
                color: filterTab === "borrowed_by_me" ? "#ffffff" : "var(--text-secondary)",
                transition: "all 0.2s"
              }}
            >
              My Borrowed ({myBorrowedCount})
            </button>
          )}
        </div>

        {/* Genre Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={15} style={{ color: "var(--text-muted)" }} />
          <select
            className="form-input"
            style={{ width: "auto", padding: "8px 12px", cursor: "pointer", fontSize: "0.88rem" }}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genres.map((g) => (
              <option key={g} value={g} style={{ background: "#111827", color: "white" }}>
                {g === "All" ? "All Categories" : g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
          <div className="pulse-dot" style={{ margin: "0 auto 14px auto", width: 12, height: 12, background: "var(--accent-primary)" }} />
          <p>Loading books from library database...</p>
        </div>
      ) : displayedBooks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "50px 20px" }}>
          <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            No books found
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: 4, marginBottom: 16 }}>
            {filterTab === "borrowed_by_me"
              ? "You do not have any borrowed books at the moment."
              : "Try clearing your search query or reset books to available."}
          </p>
          <button
            onClick={() => { setFilterTab("all"); setSearchTerm(""); setSelectedGenre("All"); }}
            className="btn btn-secondary btn-sm"
          >
            View All Books
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 20
        }}>
          {displayedBooks.map((book) => {
            const isBorrowedByMe = myActiveBorrowings.includes(book.id);

            return (
              <div
                key={book.id}
                className="glass-panel"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  border: isBorrowedByMe
                    ? "1px solid rgba(14, 165, 233, 0.45)"
                    : "1px solid var(--border-subtle)",
                  boxShadow: isBorrowedByMe ? "0 0 20px rgba(14, 165, 233, 0.15)" : undefined
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Card Header with Badges */}
                <div style={{
                  height: 76,
                  background: isBorrowedByMe
                    ? "linear-gradient(135deg, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.15) 100%)"
                    : book.available
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(14, 165, 233, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)",
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between"
                }}>
                  {/* Status Badge */}
                  {isBorrowedByMe ? (
                    <span className="badge" style={{ background: "rgba(14, 165, 233, 0.2)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.4)" }}>
                      <BookmarkCheck size={13} />
                      Borrowed by You
                    </span>
                  ) : book.available ? (
                    <span className="badge badge-available">
                      <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                      Ready to Borrow
                    </span>
                  ) : (
                    <span className="badge badge-borrowed">
                      <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                      On Loan
                    </span>
                  )}

                  {/* Category Chip */}
                  <span style={{
                    fontSize: "0.74rem",
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "var(--text-secondary)",
                    fontWeight: 600
                  }}>
                    {book.genre || "General"}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.35,
                    marginBottom: 6
                  }}>
                    {book.title}
                  </h3>
                  <p style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: 16
                  }}>
                    by <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{book.author}</span>
                  </p>

                  {/* Card Bottom Actions */}
                  <div style={{
                    marginTop: "auto",
                    paddingTop: 14,
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    {isAdmin ? (
                      /* Admin Actions: Edit & Delete */
                      <div style={{ display: "flex", width: "100%", gap: 8 }}>
                        <button
                          onClick={() => navigate(`/books/${book.id}/edit`)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(book)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: "6px 10px" }}
                          title="Delete Book"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : isBorrowedByMe ? (
                      /* Student who borrowed it: 1-click Return Book */
                      <button
                        onClick={() => handleReturn(book)}
                        className="btn btn-success btn-sm"
                        style={{ width: "100%" }}
                        disabled={actionBookId === book.id}
                      >
                        <RotateCcw size={15} />
                        <span>{actionBookId === book.id ? "Returning..." : "Return Book"}</span>
                      </button>
                    ) : book.available ? (
                      /* Student wants to borrow: 1-click Borrow Book */
                      <button
                        onClick={() => handleBorrow(book)}
                        className="btn btn-primary btn-sm"
                        style={{ width: "100%" }}
                        disabled={actionBookId === book.id}
                      >
                        <BookmarkPlus size={15} />
                        <span>{actionBookId === book.id ? "Borrowing..." : "Borrow Book"}</span>
                      </button>
                    ) : (
                      /* Book is on loan to someone else: Provide clear message & return-and-borrow option */
                      <div style={{ width: "100%", display: "flex", gap: 6 }}>
                        <span style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          background: "rgba(255, 255, 255, 0.04)",
                          borderRadius: "var(--radius-sm)",
                          padding: "6px 8px"
                        }}>
                          On Loan to Reader
                        </span>
                        <button
                          onClick={() => handleBorrow(book)}
                          className="btn btn-secondary btn-sm"
                          title="Borrow a copy of this book"
                          style={{ fontSize: "0.78rem", padding: "6px 10px" }}
                        >
                          Borrow
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
