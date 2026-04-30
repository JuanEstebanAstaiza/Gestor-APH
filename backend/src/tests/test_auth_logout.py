class TestLogoutSuccess:
    def test_logout_revokes_token(self, client, db_session):
        from src.models.refresh_token import RefreshToken
        from src.core.security import hash_password

        login_resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        refresh_token = login_resp.json()["refresh_token"]

        resp = client.post("/api/auth/logout", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 200
        assert resp.json()["message"] == "Sesión cerrada"

        # Verify token is revoked
        token_hash = hash_password(refresh_token)
        rt = db_session.query(RefreshToken).filter_by(token_hash=token_hash).first()
        assert rt is not None
        assert rt.revoked is True

    def test_logout_returns_message(self, client):
        login_resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        refresh_token = login_resp.json()["refresh_token"]

        resp = client.post("/api/auth/logout", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data


class TestLogoutFailure:
    def test_logout_with_invalid_token(self, client):
        resp = client.post("/api/auth/logout", json={
            "refresh_token": "invalid-token",
        })
        assert resp.status_code == 200
        # Logout doesn't fail for invalid tokens — it silently ignores them

    def test_logout_with_empty_body(self, client):
        resp = client.post("/api/auth/logout", json={})
        assert resp.status_code == 422


class TestLogoutPreventsRefresh:
    def test_cannot_refresh_after_logout(self, client, db_session):
        from src.models.refresh_token import RefreshToken
        from src.core.security import hash_password

        login_resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        refresh_token = login_resp.json()["refresh_token"]

        # Logout
        client.post("/api/auth/logout", json={
            "refresh_token": refresh_token,
        })

        # Try to refresh — should fail
        resp = client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 401
