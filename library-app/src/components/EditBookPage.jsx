import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit3, ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "../api/client";

export default function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [available, setAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await api.getBook(id);
        setTitle(data.title);
        setAuthor(data.author);
        setGenre(data.genre || "General");
        setAvailable(data.available);
      } catch (err) {
        setError(err.message || "Failed to load book details");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError("Please fill in both title and author");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await api.updateBook(id, {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim() || "General",
        available: available,
      });
      setSuccess("Book updated successfully!");
      setTimeout(() => navigate("/books"), 1000);
    } catch (err) {
      setError(err.message || "Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-secondary)" }}>
        <p>Loading book information...</p>
      </div>
    );
  }

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
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <Edit3 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Edit Book Details
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Update title, author, category or availability status for Book #{id}
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
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-title">
              Book Title *
            </label>
            <input
              id="edit-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-author">
              Author *
            </label>
            <input
              id="edit-author"
              type="text"
              className="form-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-genre">
              Genre / Category
            </label>
            <input
              id="edit-genre"
              type="text"
              className="form-input"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer"
            }}>
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--accent-primary)", cursor: "pointer" }}
              />
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Book Available for Borrowing
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Check this to make the book borrowable by readers in the catalog
                </div>
              </div>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
            <Link to="/books" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
