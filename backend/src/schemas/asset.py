from pydantic import BaseModel


class AssetCreate(BaseModel):
    asset_type: str
    unit_number: str
    floor: int | None = None
    area_sqm: str | None = None


class AssetUpdate(BaseModel):
    asset_type: str | None = None
    unit_number: str | None = None
    floor: int | None = None
    area_sqm: str | None = None
    is_active: bool | None = None


class AssetOut(BaseModel):
    id: int
    asset_type: str
    unit_number: str
    floor: int | None
    area_sqm: str | None
    is_active: bool

    model_config = {"from_attributes": True}
