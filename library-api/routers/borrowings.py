from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models.book import Book
from models.borrowing import Borrowing
from models.user import User
from schemas.borrowing import BorrowingCreate, BorrowingOut
from dependencies import require_admin, require_user

router = APIRouter(prefix="/borrowings", tags=["Borrowings"])

@router.get("", response_model=List[BorrowingOut])
def view_all_borrowings(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    borrowings = (
        db.query(Borrowing)
        .options(joinedload(Borrowing.book), joinedload(Borrowing.user))
        .order_by(Borrowing.borrow_date.desc())
        .all()
    )
    return borrowings

@router.get("/me", response_model=List[BorrowingOut])
def view_my_borrowings(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    borrowings = (
        db.query(Borrowing)
        .filter(Borrowing.user_id == current_user.id)
        .options(joinedload(Borrowing.book))
        .order_by(Borrowing.borrow_date.desc())
        .all()
    )
    return borrowings

@router.post("", response_model=BorrowingOut, status_code=status.HTTP_201_CREATED)
def borrow_book(
    borrowing_data: BorrowingCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == borrowing_data.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    if not book.available:
        # Check if the user already has this book borrowed
        existing_loan = db.query(Borrowing).filter(
            Borrowing.book_id == book.id,
            Borrowing.user_id == current_user.id,
            Borrowing.returned == False
        ).first()
        if existing_loan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already borrowed this book. You can return it whenever you are finished reading!"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This book is currently on loan to another reader."
        )

    # Mark book unavailable
    book.available = False

    new_borrowing = Borrowing(
        book_id=book.id,
        user_id=current_user.id,
        borrow_date=datetime.now(timezone.utc),
        returned=False
    )
    db.add(new_borrowing)
    db.commit()
    db.refresh(new_borrowing)
    return new_borrowing

@router.put("/{id}", response_model=BorrowingOut)
def mark_book_as_returned(
    id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    borrowing = db.query(Borrowing).filter(Borrowing.id == id).first()
    if not borrowing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Borrowing record not found"
        )

    # Admin can return any borrowing; regular user can return their own
    if current_user.role != "admin" and borrowing.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to return this borrowing"
        )

    if borrowing.returned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This book has already been marked as returned"
        )

    borrowing.returned = True

    # Mark the book as available again
    book = db.query(Book).filter(Book.id == borrowing.book_id).first()
    if book:
        book.available = True

    db.commit()
    db.refresh(borrowing)
    return borrowing

@router.post("/return-by-book/{book_id}", response_model=BorrowingOut)
def return_borrowing_by_book_id(
    book_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    query = db.query(Borrowing).filter(Borrowing.book_id == book_id, Borrowing.returned == False)
    if current_user.role != "admin":
        query = query.filter(Borrowing.user_id == current_user.id)

    borrowing = query.order_by(Borrowing.id.desc()).first()
    if not borrowing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active borrowing record found for this book"
        )

    borrowing.returned = True
    book = db.query(Book).filter(Book.id == book_id).first()
    if book:
        book.available = True

    db.commit()
    db.refresh(borrowing)
    return borrowing

@router.post("/return-all-my")
def return_all_my_borrowings(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    user_active_loans = db.query(Borrowing).filter(
        Borrowing.user_id == current_user.id,
        Borrowing.returned == False
    ).all()

    for loan in user_active_loans:
        loan.returned = True
        book = db.query(Book).filter(Book.id == loan.book_id).first()
        if book:
            book.available = True

    db.commit()
    return {"message": f"Successfully returned {len(user_active_loans)} books. All are now available!"}

@router.post("/reset-all")
def reset_all_books_to_available(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    active_borrowings = db.query(Borrowing).filter(Borrowing.returned == False).all()
    for b in active_borrowings:
        b.returned = True

    all_books = db.query(Book).all()
    for bk in all_books:
        bk.available = True

    db.commit()
    return {"message": "All books have been returned and reset to available status"}
