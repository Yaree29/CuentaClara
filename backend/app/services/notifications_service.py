from app.database import supabase_admin

# Mapeo entre el event_type que reporta cada servicio de negocio y la columna
# de preferencia correspondiente en business_notification_preferences.
PREFERENCE_COLUMN_BY_EVENT = {
    "sales": "notify_sales",
    "inventory": "notify_inventory",
}


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


def notify_owner_of_assistant_action(business_id: str, event_type: str, message: str) -> None:
    """
    Best-effort: nunca lanza (mismo criterio que el borrado best-effort de
    `notifications` en business_service.py::delete_business_data). Se llama
    SOLO cuando la acción fue registrada por un asistente (assistant_id no
    es None) desde sales_service/inventory_service — nunca cuando actúa el
    dueño directamente.

    Decisión del proyecto: NO se envía push real (FCM/Firebase) — solo se
    inserta el registro en `notifications`. El frontend ya está suscrito por
    Realtime de Supabase a esta tabla (useNotifications.js), así que la
    alerta llega de inmediato mientras la app está abierta o recién en
    segundo plano, sin necesitar credenciales de Firebase.
    """
    try:
        owner = supabase_admin.table("users") \
            .select("id") \
            .eq("business_id", business_id) \
            .eq("role", "owner") \
            .execute()
        if not owner.data:
            return
        owner_user_id = owner.data[0]["id"]

        pref_column = PREFERENCE_COLUMN_BY_EVENT.get(event_type)
        if pref_column:
            prefs = supabase_admin.table("business_notification_preferences") \
                .select(pref_column) \
                .eq("business_id", business_id) \
                .execute()
            if prefs.data and prefs.data[0].get(pref_column) is False:
                return  # el dueño desactivó este tipo de alerta

        supabase_admin.table("notifications").insert({
            "business_id": business_id,
            "user_id": owner_user_id,
            "type": "alert",
            "message": message,
            "channel": "push",
        }).execute()
    except Exception:
        pass


# ── Preferencias de notificación ────────────────────────────────────────────

NOTIFICATION_PREF_FLAGS = ["sales", "inventory"]


def get_notification_preferences(business_id: str) -> dict:
    result = supabase_admin.table("business_notification_preferences") \
        .select("business_id, notify_sales, notify_inventory") \
        .eq("business_id", business_id) \
        .execute()

    if result.data:
        row = result.data[0]
        return {
            "business_id": business_id,
            "sales": row.get("notify_sales", True),
            "inventory": row.get("notify_inventory", True),
        }

    return {"business_id": business_id, "sales": True, "inventory": True}


def update_notification_preferences(business_id: str, data) -> dict:
    update_fields = {
        PREFERENCE_COLUMN_BY_EVENT[flag]: getattr(data, flag)
        for flag in NOTIFICATION_PREF_FLAGS
        if getattr(data, flag) is not None
    }

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    supabase_admin.table("business_notification_preferences") \
        .upsert({"business_id": business_id, **update_fields}, on_conflict="business_id") \
        .execute()

    return get_notification_preferences(business_id)
