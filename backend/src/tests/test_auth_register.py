class TestRegisterSuccess:
    def test_register_creates_user(self, client, db_session):
        from src.models.user import User

        resp = client.post("/api/auth/register", json={
            "email": "new-resident@test.com",
            "password": "testpassword123",
            "full_name": "New Resident",
            "phone": "987654321",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "new-resident@test.com"
        assert data["full_name"] == "New Resident"
        assert data["role"] == "residente"
        assert data["status"] == "pending"

    def test_register_without_phone(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "no-phone@test.com",
            "password": "testpassword123",
            "full_name": "No Phone",
        })
        assert resp.status_code == 201

    def test_register_returns_user_out(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "user-out@test.com",
            "password": "testpassword123",
            "full_name": "User Out",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "id" in data
        assert "uuid" in data
        assert "is_active" in data
        assert "created_at" in data


class TestRegisterFailure:
    def test_register_duplicate_email(self, client):
        # Register first user
        client.post("/api/auth/register", json={
            "email": "duplicate@test.com",
            "password": "testpassword123",
            "full_name": "Duplicate",
        })

        # Try to register again
        resp = client.post("/api/auth/register", json={
            "email": "duplicate@test.com",
            "password": "testpassword123",
            "full_name": "Duplicate 2",
        })
        assert resp.status_code == 409
        assert "Email ya registrado" in resp.json()["detail"]

    def test_register_with_empty_body(self, client):
        resp = client.post("/api/auth/register", json={})
        assert resp.status_code == 422

    def test_register_with_missing_name(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "no-name@test.com",
            "password": "testpassword123",
        })
        assert resp.status_code == 422


class TestRegisterStatusPending:
    def test_registered_user_has_pending_status(self, client, db_session):
        from src.models.user import User

        client.post("/api/auth/register", json={
            "email": "pending-user@test.com",
            "password": "testpassword123",
            "full_name": "Pending User",
        })

        user = db_session.query(User).filter_by(email="pending-user@test.com").first()
        assert user is not None
        assert user.status == "pending"
