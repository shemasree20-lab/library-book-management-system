from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models.user import User
from models.book import Book
from utils.hashing import hash_password
from routers import auth_router, books_router, borrowings_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Library Book Management API",
    description="Backend API with RBAC for Library Book Management System",
    version="1.0.0"
)

# CORS configuration to allow local React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(books_router)
app.include_router(borrowings_router)

@app.on_event("startup")
def startup_db_seed():
    db = SessionLocal()
    try:
        # Seed default admin if not present
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                hashed_password=hash_password("admin123"),
                role="admin"
            )
            db.add(admin_user)

        # Seed default regular user if not present
        student_user = db.query(User).filter(User.username == "student").first()
        if not student_user:
            student_user = User(
                username="student",
                hashed_password=hash_password("student123"),
                role="user"
            )
            db.add(student_user)

        # Seed sample books if empty
        if db.query(Book).count() == 0:
            sample_books = [
                Book(title="Clean Code: A Handbook of Agile Software Craftsmanship", author="Robert C. Martin", genre="Technology", available=True),
                Book(title="The Pragmatic Programmer", author="Andrew Hunt & David Thomas", genre="Technology", available=True),
                Book(title="To Kill a Mockingbird", author="Harper Lee", genre="Fiction", available=True),
                Book(title="1984", author="George Orwell", genre="Dystopian", available=True),
                Book(title="Design Patterns: Elements of Reusable Object-Oriented Software", author="Erich Gamma et al.", genre="Technology", available=True),
                Book(title="The Great Gatsby", author="F. Scott Fitzgerald", genre="Classic", available=True),
                Book(title="Sapiens: A Brief History of Humankind", author="Yuval Noah Harari", genre="History", available=True),
                Book(title="Thinking, Fast and Slow", author="Daniel Kahneman", genre="Psychology", available=True),
            ]
            db.add_all(sample_books)

        db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Welcome to the Library Book Management API",
        "docs": "/docs",
        "status": "online"
    }
