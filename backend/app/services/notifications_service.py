from app.database import supabase_admin
from datetime import datetime, timezone


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def list_notifications(
    business_id: str,
    user_id: str,
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> list:
    query = supabase_admin.table("notifications") \
        .select("id, business_id, user_id, type, message, channel, is_read, sent_at") \
        .eq("business_id", business_id) \
        .eq("user_id", user_id)

    if unread_only:
        query = query.eq("is_read", False)

    result = query.order("sent_at", desc=True) \
        .range(offset, offset + max(limit, 1) - 1) \
        .execute()

    return result.data or []


def mark_notification_read(business_id: str, user_id: str, notification_id: int) -> dict:
    result = supabase_admin.table("notifications") \
        .update({"is_read": True}) \
        .eq("id", notification_id) \
        .eq("business_id", business_id) \
        .eq("user_id", user_id) \
        .execute()

    if not result.data:
        raise ValueError("Notificación no encontrada.")

    return {"id": notification_id, "is_read": True}


def register_push_token(business_id: str, user_id: str, token: str, device_type: str) -> dict:
    payload = {
        "business_id": business_id,
        "user_id": user_id,
        "token": token,
        "device_type": device_type,
        "is_active": True,
        "last_used_at": _now_iso(),
    }

    result = supabase_admin.table("push_tokens") \
        .upsert(payload, on_conflict="user_id,token") \
        .execute()

    if result.data:
        return result.data[0]

    return payload
