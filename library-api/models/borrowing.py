from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Borrowing(Base):
    __tablename__ = "borrowings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    borrow_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    returned = Column(Boolean, default=False, nullable=False)

    book = relationship("Book", back_populates="borrowings")
    user = relationship("User", back_populates="borrowings")
