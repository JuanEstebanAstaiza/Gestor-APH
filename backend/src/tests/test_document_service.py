class TestDocumentServiceAutoClassify:
    def test_classify_actas(self):
        from src.services.document_service import auto_classify

        result = auto_classify("Acta de asamblea ordinaria")
        assert result["category_id"] is not None
        assert result["classified_by"] == "auto"

    def test_classify_financiero(self):
        from src.services.document_service import auto_classify

        result = auto_classify("Estado financiero marzo")
        assert result["category_id"] is not None
        assert result["classified_by"] == "auto"

    def test_classify_unknown(self):
        from src.services.document_service import auto_classify

        result = auto_classify("Documento sin contexto claro")
        # Should still return a valid classification
        assert result is not None


class TestDocumentServiceSearch:
    def test_search_by_keyword(self):
        from src.services.document_service import search_documents

        results = search_documents("financial", [])
        assert isinstance(results, list)

    def test_search_empty_query(self):
        from src.services.document_service import search_documents

        results = search_documents("", [])
        assert isinstance(results, list)


class TestDocumentServiceShareToken:
    def test_generate_share_token(self):
        from src.services.document_service import generate_share_token

        token = generate_share_token()
        assert token is not None
        assert len(token) > 0

    def test_share_token_is_unique(self):
        from src.services.document_service import generate_share_token

        tokens = {generate_share_token() for _ in range(100)}
        assert len(tokens) == 100
