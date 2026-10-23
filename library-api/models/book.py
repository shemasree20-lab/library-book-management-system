from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(150), nullable=False)
    author = Column(String(100), nullable=False)
    genre = Column(String(50), default="General", nullable=False)
    available = Column(Boolean, default=True, nullable=False)

    borrowings = relationship("Borrowing", back_populates="book", cascade="all, delete-orphan")
