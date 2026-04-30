from src.schemas.user import UserOut


class TestLoginSuccess:
    def test_login_with_correct_credentials(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_returns_refresh_token(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "test-residente@test.com",
            "password": "testpassword123",
        })
        assert resp.status_code == 200
        assert resp.json()["refresh_token"] is not None


class TestLoginFailure:
    def test_login_with_invalid_email(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "testpassword123",
        })
        assert resp.status_code == 401
        assert "Credenciales inválidas" in resp.json()["detail"]

    def test_login_with_wrong_password(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401
        assert "Credenciales inválidas" in resp.json()["detail"]

    def test_login_with_empty_body(self, client):
        resp = client.post("/api/auth/login", json={})
        assert resp.status_code == 422

    def test_login_with_null_password(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": None,
        })
        assert resp.status_code == 422


class TestLoginLastLogin:
    def test_last_login_is_updated(self, client, db_session):
        from src.models.user import User
        resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        assert resp.status_code == 200
        user = db_session.query(User).filter_by(email="test-admin@test.com").first()
        assert user.last_login is not None
