import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PlusCircle, ArrowLeft, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { api } from "../api/client";

export default function CreateBookPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("General");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const commonGenres = [
    "Technology", "Fiction", "Classic", "Science", 
    "History", "Philosophy", "Psychology", "Biography"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError("Please fill in both title and author");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.createBook({
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim() || "General",
      });
      navigate("/books");
    } catch (err) {
      setError(err.message || "Failed to create book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: "36px 20px" }}>
      {/* Back button */}
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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Add New Book
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Add a new title to the library catalog with details and category
            </p>
          </div>
        </div>

        {/* Error */}
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="book-title">
              Book Title *
            </label>
            <input
              id="book-title"
              type="text"
              className="form-input"
              placeholder="e.g. Design Patterns"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="book-author">
              Author(s) *
            </label>
            <input
              id="book-author"
              type="text"
              className="form-input"
              placeholder="e.g. Erich Gamma, Richard Helm"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="book-genre">
              Genre / Category
            </label>
            <input
              id="book-genre"
              type="text"
              className="form-input"
              placeholder="e.g. Technology"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              maxLength={50}
            />

            {/* Quick Genre Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {commonGenres.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGenre(g)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: genre === g ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.04)",
                    color: genre === g ? "#a5b4fc" : "var(--text-secondary)",
                    border: genre === g ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                    transition: "all 0.15s"
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
            <Link to="/books" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <PlusCircle size={17} />
              <span>{loading ? "Adding..." : "Add Book to Catalog"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
