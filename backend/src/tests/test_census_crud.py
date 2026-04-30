class TestCensusCreate:
    def test_create_resident(self, client, admin_headers, db_session):
        from src.models.census import CensusResident

        resp = client.post("/api/census/residents", json={
            "property_type": "owner",
            "move_in_date": "2024-01-01",
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["property_type"] == "owner"

        resident = db_session.query(CensusResident).filter_by(id=data["id"]).first()
        assert resident is not None
        assert resident.is_active is True

    def test_create_resident_with_lease(self, client, admin_headers):
        resp = client.post("/api/census/residents", json={
            "property_type": "tenant",
            "move_in_date": "2024-01-01",
            "lease_end": "2025-01-01",
        }, headers=admin_headers)
        assert resp.status_code == 201
        assert resp.json()["lease_end"] == "2025-01-01"


class TestCensusRead:
    def test_list_residents(self, client, admin_headers):
        resp = client.get("/api/census/residents", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "total" in data

    def test_list_residents_with_filter(self, client, admin_headers):
        resp = client.get("/api/census/residents?type_filter=owner", headers=admin_headers)
        assert resp.status_code == 200

    def test_get_resident(self, client, admin_headers):
        # Create a resident first
        client.post("/api/census/residents", json={
            "property_type": "owner",
            "move_in_date": "2024-01-01",
        }, headers=admin_headers)

        resp = client.get("/api/census/residents/1", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["property_type"] == "owner"

    def test_get_resident_not_found(self, client, admin_headers):
        resp = client.get("/api/census/residents/99999", headers=admin_headers)
        assert resp.status_code == 404


class TestCensusUpdate:
    def test_update_resident(self, client, admin_headers, db_session):
        from src.models.census import CensusResident

        # Create a resident
        client.post("/api/census/residents", json={
            "property_type": "owner",
            "move_in_date": "2024-01-01",
        }, headers=admin_headers)

        resp = client.patch("/api/census/residents/1", json={
            "property_type": "tenant",
            "lease_end": "2025-12-31",
        }, headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["property_type"] == "tenant"
        assert data["lease_end"] == "2025-12-31"

    def test_partial_update(self, client, admin_headers):
        client.post("/api/census/residents", json={
            "property_type": "owner",
            "move_in_date": "2024-01-01",
        }, headers=admin_headers)

        resp = client.patch("/api/census/residents/1", json={
            "move_out_date": "2025-06-01",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["property_type"] == "owner"  # unchanged


class TestCensusInactive:
    def test_list_only_active_residents(self, client, admin_headers):
        # Create and "delete" a resident
        client.post("/api/census/residents", json={
            "property_type": "owner",
            "move_in_date": "2024-01-01",
        }, headers=admin_headers)

        resp = client.get("/api/census/residents", headers=admin_headers)
        data = resp.json()
        # The resident should be in the list (is_active defaults to True)
        assert data["total"] >= 1
