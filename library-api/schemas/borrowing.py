from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from schemas.book import BookOut
from schemas.user import UserOut

class BorrowingCreate(BaseModel):
    book_id: int

class BorrowingOut(BaseModel):
    id: int
    book_id: int
    user_id: int
    borrow_date: datetime
    returned: bool
    book: Optional[BookOut] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True
