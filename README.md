# Library Book Management System (RBAC)

A modern full-stack Library Management System built with **FastAPI** (Python backend with SQLite & SQLAlchemy) and **React** (Vite frontend with Role-Based Access Control).

---

## 🏛️ Roles & Permissions (RBAC)

| Role | Permissions |
| :--- | :--- |
| **Admin** | • Add, Edit, Delete books<br>• View all borrowings across all users<br>• Mark books as returned |
| **User** | • Browse all catalog books with search & filter<br>• Borrow an available book<br>• View own borrowing history (`/borrowings/me`) |

---

## 🗄️ Database Tables (SQLite + SQLAlchemy)

### 1. Table: `users`
| Field | Type | Constraints |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `username` | String(50) | UNIQUE, NOT NULL |
| `hashed_password` | String | NOT NULL (Bcrypt) |
| `role` | String(10) | default='user' ('admin' / 'user') |

### 2. Table: `books`
| Field | Type | Constraints |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `title` | String(150) | NOT NULL |
| `author` | String(100) | NOT NULL |
| `genre` | String(50) | default='General' |
| `available` | Boolean | default=True |

### 3. Table: `borrowings`
| Field | Type | Constraints |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment |
| `book_id` | Integer | Foreign Key → `books.id`, NOT NULL |
| `user_id` | Integer | Foreign Key → `users.id`, NOT NULL |
| `borrow_date` | DateTime | NOT NULL |
| `returned` | Boolean | default=False |

---

## 🌐 API Routes (FastAPI)

| Method | URL | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user account |
| `POST` | `/auth/login` | Public | Login with credentials, returns JWT token |
| `GET` | `/auth/me` | User / Admin | Get current logged-in user profile |
| `GET` | `/books` | User / Admin | List all books (with search & genre filter) |
| `POST` | `/books` | Admin | Add a new book to the catalog |
| `PUT` | `/books/{id}` | Admin | Update book details and availability |
| `DELETE` | `/books/{id}` | Admin | Delete a book from catalog |
| `GET` | `/borrowings` | Admin | View all borrowings with user & book details |
| `GET` | `/borrowings/me` | User | View current user's borrowing history |
| `POST` | `/borrowings` | User | Borrow an available book |
| `PUT` | `/borrowings/{id}` | Admin | Mark borrowed book as returned |

---

## 💻 React Pages & Routing

| Path | Component | Access |
| :--- | :--- | :--- |
| `/login` | `LoginForm.jsx` | Public |
| `/register` | `RegisterForm.jsx` | Public |
| `/books` | `BookList.jsx` | User / Admin |
| `/books/new` | `CreateBookPage.jsx` | Admin |
| `/books/:id/edit` | `EditBookPage.jsx` | Admin |
| `/borrowings` | `BorrowingList.jsx` | Admin |
| `/borrowings/me` | `MyBorrowings.jsx` | User |
| `/borrowings/new` | `CreateBorrowingPage.jsx` | User |

---

## ⚡ Quick Start & Running Locally

### Default Pre-Seeded Accounts:
- **Admin**: Username: `admin` | Password: `admin123`
- **User**: Username: `student` | Password: `student123`
*(Or create a new account directly via the `/register` page!)*

### 1. Run the Backend (FastAPI):
```bash
cd library-api
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs (Swagger UI): `http://127.0.0.1:8000/docs`

### 2. Run the Frontend (React Vite):
```bash
cd library-app
npm run dev
```
- Frontend Web App: `http://localhost:5173`
