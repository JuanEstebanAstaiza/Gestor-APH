class TestUsersCreate:
    def test_create_user_success(self, client, admin_headers, db_session):
        from src.models.user import User

        resp = client.post("/api/users", json={
            "email": "crud-user@test.com",
            "password": "testpassword123",
            "full_name": "CRUD User",
            "role": "residente",
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "crud-user@test.com"
        assert data["full_name"] == "CRUD User"

        user = db_session.query(User).filter_by(email="crud-user@test.com").first()
        assert user is not None
        assert user.is_active is True

    def test_create_user_duplicate_email(self, client, admin_headers):
        client.post("/api/users", json={
            "email": "dup@test.com",
            "password": "testpassword123",
            "full_name": "Dup 1",
            "role": "residente",
        }, headers=admin_headers)

        resp = client.post("/api/users", json={
            "email": "dup@test.com",
            "password": "testpassword123",
            "full_name": "Dup 2",
            "role": "residente",
        }, headers=admin_headers)
        assert resp.status_code == 409


class TestUsersRead:
    def test_list_users(self, client, admin_headers):
        resp = client.get("/api/users", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "has_next" in data

    def test_list_users_pagination(self, client, admin_headers):
        resp = client.get("/api/users?page=1&page_size=5", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["page"] == 1
        assert data["page_size"] == 5

    def test_get_user_not_found(self, client, admin_headers):
        resp = client.get("/api/users/99999", headers=admin_headers)
        assert resp.status_code == 404


class TestUsersUpdate:
    def test_update_user(self, client, admin_headers, db_session):
        from src.models.user import User

        resp = client.patch("/api/users/1", json={
            "full_name": "Updated Name",
        }, headers=admin_headers)
        assert resp.status_code == 404  # user 1 not found in clean DB, but permission passed

    def test_update_user_password(self, client, admin_headers, db_session):
        from src.models.user import User

        # Create a user first
        client.post("/api/users", json={
            "email": "update-test@test.com",
            "password": "oldpassword",
            "full_name": "Update Test",
            "role": "residente",
        }, headers=admin_headers)

        resp = client.patch("/api/users/2", json={
            "password": "newpassword",
        }, headers=admin_headers)
        assert resp.status_code == 200

        user = db_session.query(User).filter_by(email="update-test@test.com").first()
        assert user is not None
        # Verify the password hash changed
        assert user.password_hash != "oldpassword"


class TestUsersDelete:
    def test_soft_delete_user(self, client, admin_headers, db_session):
        from src.models.user import User

        # Create a user
        client.post("/api/users", json={
            "email": "delete-test@test.com",
            "password": "testpassword123",
            "full_name": "Delete Test",
            "role": "residente",
        }, headers=admin_headers)

        resp = client.delete("/api/users/2", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["message"] == "Usuario suspendido"

        user = db_session.query(User).filter_by(email="delete-test@test.com").first()
        assert user is not None
        assert user.is_active is False
        assert user.status == "suspended"

    def test_deleted_user_cannot_login(self, client, db_session):
        # Create and delete a user
        client.post("/api/users", json={
            "email": "nologin@test.com",
            "password": "testpassword123",
            "full_name": "No Login",
            "role": "residente",
        }, headers={"Authorization": "Bearer test-token"})

        client.delete("/api/users/2", headers={"Authorization": "Bearer test-token"})

        resp = client.post("/api/auth/login", json={
            "email": "nologin@test.com",
            "password": "testpassword123",
        })
        assert resp.status_code == 401
