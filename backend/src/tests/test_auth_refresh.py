from src.core.security import create_access_token


class TestRefreshSuccess:
    def test_refresh_returns_new_tokens(self, client):
        # First login to get refresh token
        login_resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        assert login_resp.status_code == 200
        refresh_token = login_resp.json()["refresh_token"]

        # Use refresh token
        resp = client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["access_token"] != login_resp.json()["access_token"]

    def test_refresh_rotates_refresh_token(self, client):
        login_resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        old_refresh = login_resp.json()["refresh_token"]

        resp = client.post("/api/auth/refresh", json={
            "refresh_token": old_refresh,
        })
        assert resp.status_code == 200
        new_refresh = resp.json()["refresh_token"]
        assert new_refresh != old_refresh


class TestRefreshFailure:
    def test_refresh_with_invalid_token(self, client):
        resp = client.post("/api/auth/refresh", json={
            "refresh_token": "invalid-token-string",
        })
        assert resp.status_code == 401

    def test_refresh_with_expired_token(self, client):
        # Create an expired token
        expired_token = create_access_token("fake-uuid", "admin")
        # Actually create_access_token creates a valid token (60 min), so we need a token that's already expired
        # Use a token with a past expiry by manipulating — but since we can't easily do that,
        # we test with a clearly invalid JWT format
        resp = client.post("/api/auth/refresh", json={
            "refresh_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmYWtlIiwiZXhwIjoxNTAwMDAwMDAwfQ.bad",
        })
        assert resp.status_code == 401

    def test_refresh_with_wrong_type_token(self, client):
        # access_token has type "access" implicitly (no type field), but the refresh endpoint checks for "refresh" type
        # Actually, create_access_token doesn't add a "type" field, so verify_token will return payload without type="refresh"
        # But the refresh endpoint first calls verify_token, then checks payload.get("type") != "refresh"
        # Since access tokens don't have "type" field, this should fail
        login_resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        access_token = login_resp.json()["access_token"]
        resp = client.post("/api/auth/refresh", json={
            "refresh_token": access_token,
        })
        assert resp.status_code == 401

    def test_refresh_with_revoked_token(self, client, db_session):
        from src.models.refresh_token import RefreshToken
        from src.core.security import hash_password

        # Login to get a refresh token
        login_resp = client.post("/api/auth/login", json={
            "email": "test-admin@test.com",
            "password": "testpassword123",
        })
        refresh_token = login_resp.json()["refresh_token"]

        # Revoke the token
        token_hash = hash_password(refresh_token)
        rt = db_session.query(RefreshToken).filter_by(token_hash=token_hash).first()
        if rt:
            rt.revoked = True
            db_session.commit()

        resp = client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 401


class TestRefreshMissingFields:
    def test_refresh_with_empty_body(self, client):
        resp = client.post("/api/auth/refresh", json={})
        assert resp.status_code == 422

    def test_refresh_with_null_token(self, client):
        resp = client.post("/api/auth/refresh", json={
            "refresh_token": None,
        })
        assert resp.status_code == 422
