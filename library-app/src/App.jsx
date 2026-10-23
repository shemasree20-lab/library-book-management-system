import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import BookList from "./components/BookList";
import CreateBookPage from "./components/CreateBookPage";
import EditBookPage from "./components/EditBookPage";
import BorrowingList from "./components/BorrowingList";
import MyBorrowings from "./components/MyBorrowings";
import CreateBorrowingPage from "./components/CreateBorrowingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { getUser, getToken } from "./api/client";

export default function App() {
  const [currentUser, setCurrentUser] = useState(getUser());

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header user={currentUser} onLogout={handleLogout} />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                getToken() ? (
                  <Navigate to="/books" replace />
                ) : (
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                )
              }
            />
            <Route
              path="/register"
              element={
                getToken() ? (
                  <Navigate to="/books" replace />
                ) : (
                  <RegisterForm onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            {/* Authenticated Routes (User & Admin) */}
            <Route
              path="/books"
              element={
                <ProtectedRoute allowedRoles={["admin", "user"]}>
                  <BookList />
                </ProtectedRoute>
              }
            />

            {/* Admin-only Routes */}
            <Route
              path="/books/new"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CreateBookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <EditBookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrowings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BorrowingList />
                </ProtectedRoute>
              }
            />

            {/* User-only Routes */}
            <Route
              path="/borrowings/me"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <MyBorrowings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrowings/new"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CreateBorrowingPage />
                </ProtectedRoute>
              }
            />

            {/* Root & Fallback */}
            <Route
              path="/"
              element={<Navigate to={getToken() ? "/books" : "/login"} replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/books" replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
