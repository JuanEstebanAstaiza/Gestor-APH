def get_census_stats() -> dict:
    """Return census summary statistics."""
    from src.main import SessionLocal
    from src.models.census import CensusResident
    from src.models.asset import Asset
    from src.models.resident_asset import ResidentAsset

    db = SessionLocal()
    try:
        total_residents = db.query(CensusResident).filter(CensusResident.is_active == True).count()
        by_type = {}
        for ptype in ("owner", "tenant", "occupant"):
            by_type[ptype] = db.query(CensusResident).filter(
                CensusResident.is_active == True, CensusResident.property_type == ptype
            ).count()

        total_assets = db.query(Asset).filter(Asset.is_active == True).count()
        linked_assets = db.query(ResidentAsset).filter(ResidentAsset.is_primary == True).count()

        return {
            "total_residents": total_residents,
            "by_type": by_type,
            "total_assets": total_assets,
            "linked_assets": linked_assets,
        }
    finally:
        db.close()


def get_asset_occupants(asset_id: int) -> list[dict]:
    """Return occupants linked to a specific asset."""
    from src.main import SessionLocal
    from src.models.resident_asset import ResidentAsset
    from src.models.census import CensusResident

    db = SessionLocal()
    try:
        links = db.query(ResidentAsset).filter(
            ResidentAsset.asset_id == asset_id, ResidentAsset.is_active == True
        ).all()

        result = []
        for link in links:
            resident = db.query(CensusResident).filter(
                CensusResident.id == link.resident_id, CensusResident.is_active == True
            ).first()
            if resident:
                result.append({
                    "resident_id": resident.id,
                    "property_type": resident.property_type,
                    "move_in_date": resident.move_in_date,
                    "move_out_date": resident.move_out_date,
                    "lease_end": resident.lease_end,
                    "is_primary": link.is_primary,
                })
        return result
    finally:
        db.close()


def export_census(format: str = "json") -> list[dict]:
    """Export census data. MVP: JSON only (CSV pending)."""
    from src.main import SessionLocal
    from src.models.census import CensusResident

    db = SessionLocal()
    try:
        residents = db.query(CensusResident).filter(CensusResident.is_active == True).all()
        return [
            {
                "id": r.id,
                "property_type": r.property_type,
                "move_in_date": r.move_in_date,
                "move_out_date": r.move_out_date,
                "lease_end": r.lease_end,
                "is_active": r.is_active,
            }
            for r in residents
        ]
    finally:
        db.close()


def get_resident_full_profile(user_id: int) -> dict | None:
    """Return full resident profile with assets and files."""
    from src.main import SessionLocal
    from src.models.census import CensusResident
    from src.models.resident_asset import ResidentAsset
    from src.models.asset import Asset
    from src.models.resident_file import ResidentFile

    db = SessionLocal()
    try:
        resident = db.query(CensusResident).filter(
            CensusResident.user_id == user_id, CensusResident.is_active == True
        ).first()
        if not resident:
            return None

        assets = db.query(ResidentAsset).filter(
            ResidentAsset.resident_id == resident.id, ResidentAsset.is_active == True
        ).all()
        asset_list = []
        for link in assets:
            asset = db.query(Asset).filter(Asset.id == link.asset_id).first()
            if asset:
                asset_list.append({
                    "id": asset.id,
                    "asset_type": asset.asset_type,
                    "unit_number": asset.unit_number,
                    "floor": asset.floor,
                    "area_sqm": asset.area_sqm,
                    "is_primary": link.is_primary,
                })

        files = db.query(ResidentFile).filter(
            ResidentFile.resident_id == resident.id, ResidentFile.is_active == True
        ).all()
        file_list = [
            {
                "id": f.id,
                "file_name": f.file_name,
                "file_path": f.file_path,
                "file_type": f.file_type,
                "file_size": f.file_size,
            }
            for f in files
        ]

        return {
            "resident": {
                "id": resident.id,
                "property_type": resident.property_type,
                "move_in_date": resident.move_in_date,
                "move_out_date": resident.move_out_date,
                "lease_end": resident.lease_end,
            },
            "assets": asset_list,
            "files": file_list,
        }
    finally:
        db.close()
