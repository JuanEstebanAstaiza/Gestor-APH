class TestAssetsCreate:
    def test_create_asset(self, client, admin_headers, db_session):
        from src.models.asset import Asset

        resp = client.post("/api/assets", json={
            "asset_type": "apartment",
            "unit_number": "202",
            "floor": 2,
            "area_sqm": "95.50",
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["asset_type"] == "apartment"
        assert data["unit_number"] == "202"

        asset = db_session.query(Asset).filter_by(id=data["id"]).first()
        assert asset is not None

    def test_create_parking(self, client, admin_headers):
        resp = client.post("/api/assets", json={
            "asset_type": "parking",
            "unit_number": "P-10",
        }, headers=admin_headers)
        assert resp.status_code == 201

    def test_create_storage(self, client, admin_headers):
        resp = client.post("/api/assets", json={
            "asset_type": "storage",
            "unit_number": "D-5",
        }, headers=admin_headers)
        assert resp.status_code == 201


class TestAssetsRead:
    def test_list_assets(self, client, admin_headers, residente_headers):
        resp_admin = client.get("/api/assets", headers=admin_headers)
        assert resp_admin.status_code == 200
        resp_residente = client.get("/api/assets", headers=residente_headers)
        assert resp_residente.status_code == 200

    def test_get_asset(self, client, admin_headers):
        client.post("/api/assets", json={
            "asset_type": "apartment",
            "unit_number": "301",
        }, headers=admin_headers)

        resp = client.get("/api/assets/1", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["unit_number"] == "301"

    def test_get_asset_not_found(self, client, admin_headers):
        resp = client.get("/api/assets/99999", headers=admin_headers)
        assert resp.status_code == 404


class TestAssetsUpdate:
    def test_update_asset(self, client, admin_headers):
        client.post("/api/assets", json={
            "asset_type": "apartment",
            "unit_number": "101",
        }, headers=admin_headers)

        resp = client.patch("/api/assets/1", json={
            "area_sqm": "100.00",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["area_sqm"] == "100.00"


class TestAssetsDelete:
    def test_soft_delete_asset(self, client, admin_headers, db_session):
        from src.models.asset import Asset

        client.post("/api/assets", json={
            "asset_type": "apartment",
            "unit_number": "999",
        }, headers=admin_headers)

        resp = client.delete("/api/assets/1", headers=admin_headers)
        assert resp.status_code == 200

        asset = db_session.query(Asset).filter_by(unit_number="999").first()
        assert asset is not None
        assert asset.is_active is False
