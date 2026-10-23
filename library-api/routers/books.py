from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from models.book import Book
from models.user import User
from schemas.book import BookCreate, BookUpdate, BookOut
from dependencies import require_admin, require_user

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("", response_model=List[BookOut])
def list_books(
    search: Optional[str] = Query(None, description="Search by title or author"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    available_only: Optional[bool] = Query(None, description="Filter available only"),
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    if search:
        query = query.filter(
            (Book.title.ilike(f"%{search}%")) | (Book.author.ilike(f"%{search}%"))
        )
    if genre and genre != "All":
        query = query.filter(Book.genre == genre)
    if available_only is True:
        query = query.filter(Book.available == True)
    
    return query.order_by(Book.id.desc()).all()

@router.get("/{id}", response_model=BookOut)
def get_book_by_id(
    id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return book

@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def create_book(
    book_data: BookCreate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    new_book = Book(
        title=book_data.title.strip(),
        author=book_data.author.strip(),
        genre=book_data.genre.strip() if book_data.genre else "General",
        available=True
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@router.put("/{id}", response_model=BookOut)
def update_book(
    id: int,
    book_update: BookUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    
    update_data = book_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            if isinstance(val, str):
                setattr(book, field, val.strip())
            else:
                setattr(book, field, val)

    db.commit()
    db.refresh(book)
    return book

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_book(
    id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == id).first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    db.delete(book)
    db.commit()
    return {"message": f"Book with id {id} deleted successfully"}
