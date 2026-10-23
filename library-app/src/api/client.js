const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

export const getUser = () => {
  const userStr = localStorage.getItem("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};
export const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear auth and redirect if not on login/register
    if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/register")) {
      clearAuth();
      window.location.href = "/login";
    }
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.detail) || (data && data.message) || response.statusText || "Request failed";
    throw new Error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setToken(res.access_token);
    setUser(res.user);
    return res;
  },

  register: async (username, password, role = "user") => {
    return await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, role }),
    });
  },

  getCurrentUser: async () => {
    const user = await request("/auth/me");
    setUser(user);
    return user;
  },

  // Books
  getBooks: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.genre && params.genre !== "All") query.append("genre", params.genre);
    if (params.availableOnly) query.append("available_only", "true");
    
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await request(`/books${queryString}`);
  },

  getBook: async (id) => {
    return await request(`/books/${id}`);
  },

  createBook: async (bookData) => {
    return await request("/books", {
      method: "POST",
      body: JSON.stringify(bookData),
    });
  },

  updateBook: async (id, bookData) => {
    return await request(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookData),
    });
  },

  deleteBook: async (id) => {
    return await request(`/books/${id}`, {
      method: "DELETE",
    });
  },

  // Borrowings
  getAllBorrowings: async () => {
    return await request("/borrowings");
  },

  getMyBorrowings: async () => {
    return await request("/borrowings/me");
  },

  borrowBook: async (bookId) => {
    return await request("/borrowings", {
      method: "POST",
      body: JSON.stringify({ book_id: Number(bookId) }),
    });
  },

  returnBook: async (borrowingId) => {
    return await request(`/borrowings/${borrowingId}`, {
      method: "PUT",
    });
  },

  returnBookByBookId: async (bookId) => {
    return await request(`/borrowings/return-by-book/${bookId}`, {
      method: "POST",
    });
  },

  returnAllMyBooks: async () => {
    return await request("/borrowings/return-all-my", {
      method: "POST",
    });
  },

  resetAllBooks: async () => {
    return await request("/borrowings/reset-all", {
      method: "POST",
    });
  },
};

export default api;
