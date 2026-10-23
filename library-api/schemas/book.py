from typing import Optional
from pydantic import BaseModel, Field

class BookBase(BaseModel):
    title: str = Field(..., max_length=150)
    author: str = Field(..., max_length=100)
    genre: Optional[str] = Field("General", max_length=50)

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    author: Optional[str] = Field(None, max_length=100)
    genre: Optional[str] = Field(None, max_length=50)
    available: Optional[bool] = None

class BookOut(BookBase):
    id: int
    available: bool

    class Config:
        from_attributes = True
