import strawberry
from typing import List, Optional
from strawberry.types import Info
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))
from shared.database import supabase
from .types import UserType, ScanType, FertilizerLogType, SchemeType
import json

@strawberry.type
class Query:

    @strawberry.field
    def me(self, info: Info) -> Optional[UserType]:
        user_id = info.context["request"].state.user_id
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            return None
        u = result.data[0]
        return UserType(id=u["id"], name=u["name"], email=u["email"],
                       state=u.get("state"), acres=u.get("acres"),
                       created_at=str(u.get("created_at", "")))

    @strawberry.field
    def my_scans(self, info: Info, limit: int = 10) -> List[ScanType]:
        user_id = info.context["request"].state.user_id
        result = supabase.table("scans").select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit).execute()
        return [ScanType(
            id=s["id"], user_id=s["user_id"],
            recommended_crop=s.get("recommended_crop"),
            confidence=s.get("confidence"),
            n=s.get("n"), p=s.get("p"), k=s.get("k"),
            ph=s.get("ph"), temperature=s.get("temperature"),
            humidity=s.get("humidity"), rainfall=s.get("rainfall"),
            created_at=str(s.get("created_at", ""))
        ) for s in (result.data or [])]
    @strawberry.field
    def my_fertilizer_logs(self, info: Info, scan_id: Optional[str] = None) -> List[FertilizerLogType]:
        user_id = info.context["request"].state.user_id
        query = supabase.table("fertilizer_logs").select("*").eq("user_id", user_id)
        if scan_id:
            query = query.eq("scan_id", scan_id)
        result = query.order("created_at", desc=True).execute()
        return [FertilizerLogType(
            id=f["id"], scan_id=f["scan_id"], user_id=f["user_id"],
            nutrient=f.get("nutrient"), fertilizer_name=f.get("fertilizer_name"),
            dosage=f.get("dosage"), status=f.get("status"),
            created_at=str(f.get("created_at", ""))
        ) for f in (result.data or [])]

    @strawberry.field
    def schemes(self, info: Info, crop: Optional[str] = None, state: Optional[str] = None) -> List[SchemeType]:
        schemes_path = os.path.join(os.path.dirname(__file__), '../../../../data/schemes.json')
        if not os.path.exists(schemes_path):
            return []
        with open(schemes_path) as f:
            all_schemes = json.load(f)
        filtered = []
        for s in all_schemes:
            crop_match = (not crop) or ("all" in s.get("applies_to", [])) or \
                         (crop.lower() in [c.lower() for c in s.get("applies_to", [])])
            state_match = (not state) or ("all" in s.get("states", [])) or \
                          (state.lower() in [st.lower() for st in s.get("states", [])])
            if crop_match and state_match:
                filtered.append(SchemeType(
                    id=s["id"], name=s["name"], type=s["type"],
                    description=s["description"], benefit=s["benefit"],
                    link=s.get("link")
                ))
        return filtered

    @strawberry.field
    def scan_by_id(self, info: Info, scan_id: str) -> Optional[ScanType]:
        user_id = info.context["request"].state.user_id
        result = supabase.table("scans").select("*")\
            .eq("id", scan_id).eq("user_id", user_id).execute()
        if not result.data:
            return None
        s = result.data[0]
        return ScanType(
            id=s["id"], user_id=s["user_id"],
            recommended_crop=s.get("recommended_crop"),
            confidence=s.get("confidence"),
            n=s.get("n"), p=s.get("p"), k=s.get("k"),
            ph=s.get("ph"), temperature=s.get("temperature"),
            humidity=s.get("humidity"), rainfall=s.get("rainfall"),
            created_at=str(s.get("created_at", ""))
        )