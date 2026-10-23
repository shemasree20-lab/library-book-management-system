from fastapi.testclient import TestClient
from main import app, startup_db_seed

# Initialize seed data
startup_db_seed()
client = TestClient(app)

def test_api():
    print("--- 1. Testing Root Endpoint ---")
    res = client.get("/")
    assert res.status_code == 200, res.text
    print("Root endpoint OK:", res.json())

    print("\n--- 2. Testing Admin Login ---")
    res = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200, res.text
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("Admin login OK. Token received.")

    print("\n--- 3. Testing /auth/me for Admin ---")
    res = client.get("/auth/me", headers=admin_headers)
    assert res.status_code == 200, res.text
    assert res.json()["role"] == "admin"
    print("Admin /auth/me OK:", res.json())

    print("\n--- 4. Testing User Registration ---")
    reg_data = {"username": "reader_amy", "password": "readerpassword", "role": "user"}
    res = client.post("/auth/register", json=reg_data)
    # 201 or 400 if already exists
    if res.status_code == 201:
        print("Registration OK:", res.json())
    else:
        print("User already registered:", res.json())

    print("\n--- 5. Testing Reader Login ---")
    res = client.post("/auth/login", json={"username": "reader_amy", "password": "readerpassword"})
    assert res.status_code == 200, res.text
    user_token = res.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print("Reader login OK.")

    print("\n--- 6. Testing /books (User/Admin) ---")
    res = client.get("/books", headers=user_headers)
    assert res.status_code == 200
    books = res.json()
    assert len(books) > 0
    print(f"List books OK. Found {len(books)} books.")

    print("\n--- 7. Testing Admin Adding a Book (POST /books) ---")
    new_book_data = {
        "title": "Refactoring: Improving the Design of Existing Code",
        "author": "Martin Fowler",
        "genre": "Software Engineering"
    }
    res = client.post("/books", json=new_book_data, headers=admin_headers)
    assert res.status_code == 201, res.text
    created_book = res.json()
    book_id = created_book["id"]
    print(f"Created book OK: ID {book_id}, Title: {created_book['title']}")

    print("\n--- 8. Testing Admin Updating a Book (PUT /books/{id}) ---")
    res = client.put(f"/books/{book_id}", json={"genre": "Refactoring"}, headers=admin_headers)
    assert res.status_code == 200, res.text
    assert res.json()["genre"] == "Refactoring"
    print("Updated book OK.")

    print("\n--- 9. Testing User Borrowing a Book (POST /borrowings) ---")
    res = client.post("/borrowings", json={"book_id": book_id}, headers=user_headers)
    assert res.status_code == 201, res.text
    borrowing = res.json()
    borrowing_id = borrowing["id"]
    print(f"Borrow book OK: Borrowing ID {borrowing_id}")

    # Check book is now unavailable
    res = client.get(f"/books/{book_id}", headers=user_headers)
    assert res.json()["available"] is False
    print("Verified book available status changed to False.")

    print("\n--- 10. Testing User View Own Borrowings (GET /borrowings/me) ---")
    res = client.get("/borrowings/me", headers=user_headers)
    assert res.status_code == 200
    my_borrowings = res.json()
    assert any(b["id"] == borrowing_id for b in my_borrowings)
    print(f"User own borrowings OK. Found {len(my_borrowings)} borrowings.")

    print("\n--- 11. Testing Admin View All Borrowings (GET /borrowings) ---")
    res = client.get("/borrowings", headers=admin_headers)
    assert res.status_code == 200
    all_borrowings = res.json()
    assert any(b["id"] == borrowing_id for b in all_borrowings)
    print(f"Admin view all borrowings OK. Found {len(all_borrowings)} borrowings.")

    print("\n--- 12. Testing Admin Marking Book as Returned (PUT /borrowings/{id}) ---")
    res = client.put(f"/borrowings/{borrowing_id}", headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["returned"] is True
    print("Marked as returned OK.")

    # Check book is available again
    res = client.get(f"/books/{book_id}", headers=user_headers)
    assert res.json()["available"] is True
    print("Verified book available status returned to True.")

    print("\n--- 13. Testing Admin Delete Book (DELETE /books/{id}) ---")
    res = client.delete(f"/books/{book_id}", headers=admin_headers)
    assert res.status_code == 200
    print("Admin deleted book OK.")

    print("\n================ ALL BACKEND API TESTS PASSED! ================")

if __name__ == "__main__":
    test_api()
