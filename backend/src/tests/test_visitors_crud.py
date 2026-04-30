class TestVisitorsCreate:
    def test_create_visitor(self, client, admin_headers, db_session):
        from src.models.visitor import Visitor

        resp = client.post("/api/visitors", json={
            "first_name": "Juan",
            "last_name": "Perez",
            "id_document": "123456789",
            "vehicle_plate": "ABC-123",
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["first_name"] == "Juan"
        assert data["status"] == "pending"

        visitor = db_session.query(Visitor).filter_by(id=data["id"]).first()
        assert visitor is not None

    def test_create_visitor_without_vehicle(self, client, admin_headers):
        resp = client.post("/api/visitors", json={
            "first_name": "Maria",
            "last_name": "Gomez",
            "id_document": "987654321",
        }, headers=admin_headers)
        assert resp.status_code == 201
        assert resp.json()["vehicle_plate"] is None


class TestVisitorsRead:
    def test_list_visitors(self, client, admin_headers, vigilancia_headers):
        resp_admin = client.get("/api/visitors", headers=admin_headers)
        assert resp_admin.status_code == 200
        resp_vigilancia = client.get("/api/visitors", headers=vigilancia_headers)
        assert resp_vigilancia.status_code == 200

    def test_get_visitor(self, client, admin_headers):
        client.post("/api/visitors", json={
            "first_name": "Test",
            "last_name": "Visitor",
            "id_document": "TEST123",
        }, headers=admin_headers)

        resp = client.get("/api/visitors/1", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["first_name"] == "Test"

    def test_get_visitor_not_found(self, client, admin_headers):
        resp = client.get("/api/visitors/99999", headers=admin_headers)
        assert resp.status_code == 404


class TestVisitorsUpdate:
    def test_approve_visitor(self, client, admin_headers, db_session):
        client.post("/api/visitors", json={
            "first_name": "Approve",
            "last_name": "Me",
            "id_document": "APPROVE1",
        }, headers=admin_headers)

        resp = client.patch("/api/visitors/1", json={
            "status": "approved",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "approved"

    def test_revoke_visitor(self, client, admin_headers):
        client.post("/api/visitors", json={
            "first_name": "Revoke",
            "last_name": "Me",
            "id_document": "REVOKE1",
        }, headers=admin_headers)

        resp = client.patch("/api/visitors/1", json={
            "status": "revoked",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "revoked"

    def test_complete_visitor(self, client, admin_headers):
        client.post("/api/visitors", json={
            "first_name": "Complete",
            "last_name": "Me",
            "id_document": "COMPLETE1",
        }, headers=admin_headers)

        resp = client.patch("/api/visitors/1", json={
            "status": "completed",
            "exit_time": "2024-06-01T18:00:00",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "completed"


class TestVisitorsDelete:
    def test_soft_delete_visitor(self, client, admin_headers, db_session):
        from src.models.visitor import Visitor

        client.post("/api/visitors", json={
            "first_name": "Delete",
            "last_name": "Me",
            "id_document": "DELETE1",
        }, headers=admin_headers)

        resp = client.delete("/api/visitors/1", headers=admin_headers)
        assert resp.status_code == 200

        visitor = db_session.query(Visitor).filter_by(first_name="Delete").first()
        assert visitor is not None
        assert visitor.is_active is False
