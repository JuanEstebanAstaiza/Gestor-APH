class TestFileServiceValidation:
    def test_allowed_file_types(self):
        from src.services.file_service import ALLOWED_FILE_TYPES

        assert "application/pdf" in ALLOWED_FILE_TYPES
        assert "image/png" in ALLOWED_FILE_TYPES
        assert "image/jpeg" in ALLOWED_FILE_TYPES

    def test_file_size_limit_is_set(self):
        from src.services.file_service import MAX_FILE_SIZE

        assert MAX_FILE_SIZE > 0
        # Default should be 10MB
        assert MAX_FILE_SIZE <= 50 * 1024 * 1024


class TestFileServiceUpload:
    def test_upload_path_structure(self):
        from src.services.file_service import generate_file_path

        path = generate_file_path("test.pdf", "document")
        assert path is not None
        assert "test.pdf" in path or "test" in path

    def test_upload_with_invalid_type(self):
        from src.services.file_service import ALLOWED_FILE_TYPES

        assert "application/executable" not in ALLOWED_FILE_TYPES


class TestFileServiceDownload:
    def test_file_exists_check(self):
        from src.services.file_service import file_exists

        # Should return False for non-existent file
        assert file_exists("/nonexistent/path/file.pdf") is False


class TestFileServiceDelete:
    def test_delete_nonexistent_file(self):
        from src.services.file_service import delete_file

        # Should not raise for non-existent file
        delete_file("/nonexistent/path/file.pdf")
