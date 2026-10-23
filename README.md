# Library Book Management System

A modern, full-stack web application for managing library books and borrowing activities.

## Features

- User registration and login
- Role-based access for Admin and Users
- Add, edit, delete, and search books
- Borrow available books
- Track borrowing history
- Manage book returns
- Clean and user-friendly interface

## Technologies Used

- **Frontend:** React, Vite
- **Backend:** Python, FastAPI
- **Database:** SQLite, SQLAlchemy
- **Authentication:** JWT

## Project Structure

- `library-app/` — React frontend
- `library-api/` — FastAPI backend
- `.gitignore` — Files excluded from Git tracking

## Running the Project

### Backend

```bash
cd library-api
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend

Open a separate terminal:

```bash
cd library-app
npm install
npm run dev
```

Open the local URL shown in the frontend terminal.

## Project Purpose

This project demonstrates full-stack web development, database integration, authentication, and role-based access control.
