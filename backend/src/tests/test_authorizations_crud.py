class TestAuthorizationsCreate:
    def test_create_authorization(self, client, admin_headers, db_session):
        from src.models.authorization import Authorization

        resp = client.post("/api/authorizations", json={
            "requester_id": 1,
            "target_type": "vehicle",
            "target_desc": "Toyota Corolla ABC-123",
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "pending"

        auth = db_session.query(Authorization).filter_by(id=data["id"]).first()
        assert auth is not None


class TestAuthorizationsRead:
    def test_list_authorizations(self, client, admin_headers):
        client.post("/api/authorizations", json={
            "requester_id": 1,
            "target_type": "visitor",
            "target_desc": "Guest visit",
        }, headers=admin_headers)

        resp = client.get("/api/authorizations", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "total" in data

    def test_get_authorization(self, client, admin_headers):
        client.post("/api/authorizations", json={
            "requester_id": 1,
            "target_type": "vehicle",
            "target_desc": "Car XYZ",
        }, headers=admin_headers)

        resp = client.get("/api/authorizations/1", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["target_type"] == "vehicle"

    def test_get_authorization_not_found(self, client, admin_headers):
        resp = client.get("/api/authorizations/99999", headers=admin_headers)
        assert resp.status_code == 404


class TestAuthorizationsUpdate:
    def test_approve_authorization(self, client, admin_headers, db_session):
        client.post("/api/authorizations", json={
            "requester_id": 1,
            "target_type": "vehicle",
            "target_desc": "Approved Car",
        }, headers=admin_headers)

        resp = client.patch("/api/authorizations/1", json={
            "status": "approved",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "approved"

    def test_reject_authorization(self, client, admin_headers):
        client.post("/api/authorizations", json={
            "requester_id": 1,
            "target_type": "vehicle",
            "target_desc": "Rejected Car",
        }, headers=admin_headers)

        resp = client.patch("/api/authorizations/1", json={
            "status": "rejected",
            "notes": "Not authorized",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "rejected"


class TestAuthorizationsDelete:
    def test_soft_delete_authorization(self, client, admin_headers, db_session):
        from src.models.authorization import Authorization

        client.post("/api/authorizations", json={
            "requester_id": 1,
            "target_type": "vehicle",
            "target_desc": "Delete Me",
        }, headers=admin_headers)

        resp = client.delete("/api/authorizations/1", headers=admin_headers)
        assert resp.status_code == 200

        auth = db_session.query(Authorization).filter_by(target_desc="Delete Me").first()
        assert auth is not None
        assert auth.is_active is False
