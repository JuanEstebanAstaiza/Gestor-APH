class TestDocumentsCreate:
    def test_upload_document(self, client, admin_headers, db_session):
        from src.models.document import Document

        resp = client.post("/api/documents", json={
            "title": "Test Document",
            "description": "A test document",
            "file_path": "/uploads/test.pdf",
            "file_type": "application/pdf",
            "file_size": 1024,
            "category_id": 1,
            "created_by": 1,
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Test Document"
        assert "uuid" in data

        doc = db_session.query(Document).filter_by(uuid=data["uuid"]).first()
        assert doc is not None

    def test_upload_document_without_category(self, client, admin_headers):
        resp = client.post("/api/documents", json={
            "title": "Uncategorized",
            "file_path": "/uploads/test2.pdf",
            "file_type": "pdf",
            "file_size": 512,
            "created_by": 1,
        }, headers=admin_headers)
        assert resp.status_code == 201


class TestDocumentsRead:
    def test_list_documents(self, client, admin_headers):
        client.post("/api/documents", json={
            "title": "Doc 1",
            "file_path": "/uploads/d1.pdf",
            "file_type": "pdf",
            "file_size": 100,
            "created_by": 1,
        }, headers=admin_headers)

        resp = client.get("/api/documents", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "total" in data

    def test_get_document(self, client, admin_headers):
        client.post("/api/documents", json={
            "title": "Get Me",
            "file_path": "/uploads/get.pdf",
            "file_type": "pdf",
            "file_size": 100,
            "created_by": 1,
        }, headers=admin_headers)

        resp = client.get("/api/documents/1", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "Get Me"

    def test_search_documents(self, client, admin_headers):
        client.post("/api/documents", json={
            "title": "Financial Report Q1",
            "file_path": "/uploads/fin.pdf",
            "file_type": "pdf",
            "file_size": 200,
            "created_by": 1,
        }, headers=admin_headers)

        resp = client.get("/api/documents/search?q=Financial", headers=admin_headers)
        assert resp.status_code == 200


class TestDocumentsUpdate:
    def test_update_document(self, client, admin_headers):
        client.post("/api/documents", json={
            "title": "Original",
            "file_path": "/uploads/orig.pdf",
            "file_type": "pdf",
            "file_size": 100,
            "created_by": 1,
        }, headers=admin_headers)

        resp = client.patch("/api/documents/1", json={
            "title": "Updated Title",
            "description": "New description",
        }, headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Title"


class TestDocumentsDelete:
    def test_soft_delete_document(self, client, admin_headers, db_session):
        from src.models.document import Document

        client.post("/api/documents", json={
            "title": "Delete Me",
            "file_path": "/uploads/del.pdf",
            "file_type": "pdf",
            "file_size": 100,
            "created_by": 1,
        }, headers=admin_headers)

        resp = client.delete("/api/documents/1", headers=admin_headers)
        assert resp.status_code == 200

        doc = db_session.query(Document).filter_by(title="Delete Me").first()
        assert doc is not None
        assert doc.is_active is False


class TestDocumentsShare:
    def test_share_link_returns_token(self, client, admin_headers):
        client.post("/api/documents", json={
            "title": "Share Me",
            "file_path": "/uploads/share.pdf",
            "file_type": "pdf",
            "file_size": 100,
            "created_by": 1,
            "is_public": False,
        }, headers=admin_headers)

        resp = client.post("/api/documents/1/share", headers=admin_headers)
        assert resp.status_code == 200
        assert "share_token" in resp.json()
