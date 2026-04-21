from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    def __init__(self, entity: str, entity_id: int | str | None = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity} {'#' + str(entity_id) if entity_id else 'no encontrado'}",
        )


class ConflictError(HTTPException):
    def __init__(self, message: str = "Recurso ya existe"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message,
        )
