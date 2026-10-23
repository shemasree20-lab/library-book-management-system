from routers.auth import router as auth_router
from routers.books import router as books_router
from routers.borrowings import router as borrowings_router

__all__ = ["auth_router", "books_router", "borrowings_router"]
