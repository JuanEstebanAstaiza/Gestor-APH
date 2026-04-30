class TestRoleHierarchy:
    def test_admin_can_access_admin_only(self, client, admin_headers):
        resp = client.get("/api/users", headers=admin_headers)
        assert resp.status_code == 200

    def test_consejo_cannot_access_admin_only(self, client, residente_headers):
        resp = client.get("/api/users", headers=residente_headers)
        assert resp.status_code == 403

    def test_vigilancia_cannot_access_admin_only(self, client, residente_headers):
        resp = client.get("/api/users", headers=residente_headers)
        assert resp.status_code == 403

    def test_residente_cannot_access_admin_only(self, client, residente_headers):
        resp = client.get("/api/users", headers=residente_headers)
        assert resp.status_code == 403


class TestRoleMinRole:
    def test_consejo_can_get_users(self, client, admin_headers):
        """Consejo can GET /api/users (requires consejo)"""
        resp = client.get("/api/users/1", headers=admin_headers)
        assert resp.status_code == 404  # user not found but permission passed

    def test_residente_cannot_get_users_detail(self, client, residente_headers):
        """Residente cannot GET /api/users/{id} (requires consejo)"""
        resp = client.get("/api/users/1", headers=residente_headers)
        assert resp.status_code == 403


class TestUnauthenticated:
    def test_unauthenticated_cannot_access_protected(self, client):
        resp = client.get("/api/users")
        assert resp.status_code == 401

    def test_unauthenticated_cannot_get_me(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_invalid_token_cannot_access(self, client):
        resp = client.get("/api/users", headers={"Authorization": "Bearer invalid-token"})
        assert resp.status_code == 401


class TestSuspendedUser:
    def test_suspended_user_cannot_access(self, client):
        from src.core.security import create_access_token
        import uuid as uuid_lib

        suspended_uuid = uuid_lib.uuid4()
        token = create_access_token(str(suspended_uuid), "residente")
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401
