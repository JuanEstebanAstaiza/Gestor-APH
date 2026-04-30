class TestUsersEndpointAccess:
    def test_list_users_requires_admin(self, client, admin_headers, residente_headers):
        resp_admin = client.get("/api/users", headers=admin_headers)
        assert resp_admin.status_code == 200
        resp_residente = client.get("/api/users", headers=residente_headers)
        assert resp_residente.status_code == 403

    def test_get_user_requires_consejo(self, client, admin_headers, residente_headers):
        resp_admin = client.get("/api/users/1", headers=admin_headers)
        # 404 means permission passed (user not found)
        assert resp_admin.status_code == 404
        resp_residente = client.get("/api/users/1", headers=residente_headers)
        assert resp_residente.status_code == 403

    def test_create_user_requires_admin(self, client, admin_headers, residente_headers):
        resp_admin = client.post("/api/users", json={
            "email": "new@test.com",
            "password": "testpassword123",
            "full_name": "New User",
            "role": "residente",
        }, headers=admin_headers)
        assert resp_admin.status_code == 201
        resp_residente = client.post("/api/users", json={
            "email": "new2@test.com",
            "password": "testpassword123",
            "full_name": "New User 2",
            "role": "residente",
        }, headers=residente_headers)
        assert resp_residente.status_code == 403

    def test_update_user_requires_consejo(self, client, admin_headers, residente_headers):
        resp_admin = client.patch("/api/users/1", json={
            "full_name": "Updated",
        }, headers=admin_headers)
        assert resp_admin.status_code == 404  # permission passed
        resp_residente = client.patch("/api/users/1", json={
            "full_name": "Updated",
        }, headers=residente_headers)
        assert resp_residente.status_code == 403

    def test_delete_user_requires_admin(self, client, admin_headers, residente_headers):
        resp_admin = client.delete("/api/users/1", headers=admin_headers)
        assert resp_admin.status_code == 404  # permission passed
        resp_residente = client.delete("/api/users/1", headers=residente_headers)
        assert resp_residente.status_code == 403


class TestCensusEndpointAccess:
    def test_list_residents_requires_admin_or_consejo(self, client, admin_headers, residente_headers):
        resp_admin = client.get("/api/census/residents", headers=admin_headers)
        assert resp_admin.status_code == 200
        resp_residente = client.get("/api/census/residents", headers=residente_headers)
        assert resp_residente.status_code == 403

    def test_get_resident_requires_admin_or_consejo(self, client, admin_headers):
        resp = client.get("/api/census/residents/1", headers=admin_headers)
        assert resp.status_code == 404  # permission passed


class TestAssetsEndpointAccess:
    def test_list_assets_open(self, client, admin_headers, residente_headers):
        resp_admin = client.get("/api/assets", headers=admin_headers)
        assert resp_admin.status_code == 200
        resp_residente = client.get("/api/assets", headers=residente_headers)
        assert resp_residente.status_code == 200


class TestAuditEndpointAccess:
    def test_audit_requires_consejo(self, client, admin_headers, residente_headers):
        resp_admin = client.get("/api/audit", headers=admin_headers)
        assert resp_admin.status_code == 200
        resp_residente = client.get("/api/audit", headers=residente_headers)
        assert resp_residente.status_code == 403
