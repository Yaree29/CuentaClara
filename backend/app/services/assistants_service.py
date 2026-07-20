# =============================================================================
# assistants_service.py
# ---------------------
# Lógica de negocio para el módulo /assistants (Modo Asistente).
# Consulta y actualiza la tabla `business_assistants` en Supabase.
#
# Hashing del PIN: no hay passlib/bcrypt del lado del PIN a propósito — bcrypt
# guarda el salt embebido en el propio hash, pero el schema ya tiene columnas
# separadas `pin_hash`/`pin_salt` (creadas manualmente), así que se usa
# hashlib.sha256(salt + pin) para que ambas columnas tengan un uso real. Es
# suficiente para un PIN local de 4-6 dígitos verificado en el propio
# dispositivo (no hay ataque de fuerza bruta remoto posible).
# =============================================================================
import hashlib
import secrets

from app.database import supabase_admin

MAX_ASSISTANTS_PER_BUSINESS = 3

# Columnas seguras para exponer al frontend — nunca incluir pin_hash/pin_salt.
SAFE_COLUMNS = "id, business_id, name, access_type, is_blocked, created_at"


def _hash_pin(pin: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}{pin}".encode()).hexdigest()


def _get_assistant_or_404(business_id: str, assistant_id: int) -> dict:
    # Siempre se filtra por business_id además del id del path — así un dueño
    # nunca puede tocar (ni siquiera leer el status de) un asistente de otro
    # negocio, aunque adivine el id.
    result = supabase_admin.table("business_assistants")\
        .select("*")\
        .eq("id", assistant_id)\
        .eq("business_id", business_id)\
        .execute()

    if not result.data:
        raise ValueError("Asistente no encontrado")

    return result.data[0]


def create_assistant(business_id: str, data) -> dict:
    active_count = supabase_admin.table("business_assistants")\
        .select("id", count="exact")\
        .eq("business_id", business_id)\
        .eq("is_blocked", False)\
        .execute()

    if (active_count.count or 0) >= MAX_ASSISTANTS_PER_BUSINESS:
        raise ValueError(f"Ya existen {MAX_ASSISTANTS_PER_BUSINESS} asistentes activos para este negocio")

    salt = secrets.token_hex(16)
    pin_hash = _hash_pin(data.pin, salt)

    result = supabase_admin.table("business_assistants").insert({
        "business_id": business_id,
        "name": data.name.strip(),
        "pin_hash": pin_hash,
        "pin_salt": salt,
        "access_type": data.access_type,
        "is_blocked": False,
    }).execute()

    row = result.data[0]
    return {k: row[k] for k in ("id", "business_id", "name", "access_type", "is_blocked", "created_at")}


def list_assistants(business_id: str) -> list:
    """Lista completa (incluye bloqueados) para la pantalla 'Equipo' del dueño."""
    result = supabase_admin.table("business_assistants")\
        .select(SAFE_COLUMNS)\
        .eq("business_id", business_id)\
        .order("created_at")\
        .execute()

    return result.data


def list_active_assistants(business_id: str) -> list:
    """Solo activos, para el selector que ven los asistentes al entrar."""
    result = supabase_admin.table("business_assistants")\
        .select("id, name, access_type")\
        .eq("business_id", business_id)\
        .eq("is_blocked", False)\
        .order("name")\
        .execute()

    return result.data


def update_assistant(business_id: str, assistant_id: int, data) -> dict:
    _get_assistant_or_404(business_id, assistant_id)

    update_fields = {}
    if data.name is not None:
        update_fields["name"] = data.name.strip()
    if data.access_type is not None:
        update_fields["access_type"] = data.access_type
    if data.is_blocked is not None:
        update_fields["is_blocked"] = data.is_blocked
    if data.new_pin is not None:
        salt = secrets.token_hex(16)
        update_fields["pin_salt"] = salt
        update_fields["pin_hash"] = _hash_pin(data.new_pin, salt)

    if not update_fields:
        raise ValueError("No se proporcionaron campos para actualizar")

    supabase_admin.table("business_assistants")\
        .update(update_fields)\
        .eq("id", assistant_id)\
        .eq("business_id", business_id)\
        .execute()

    result = supabase_admin.table("business_assistants")\
        .select(SAFE_COLUMNS)\
        .eq("id", assistant_id)\
        .execute()

    return result.data[0]


def verify_pin(business_id: str, assistant_id: int, pin: str) -> dict:
    assistant = _get_assistant_or_404(business_id, assistant_id)

    if assistant["is_blocked"]:
        raise ValueError("Este asistente está bloqueado")

    expected_hash = _hash_pin(pin, assistant["pin_salt"])
    if not secrets.compare_digest(expected_hash, assistant["pin_hash"]):
        raise ValueError("PIN incorrecto")

    return {
        "id": assistant["id"],
        "name": assistant["name"],
        "access_type": assistant["access_type"],
    }


def get_status(business_id: str, assistant_id: int) -> dict:
    assistant = _get_assistant_or_404(business_id, assistant_id)
    return {"id": assistant["id"], "is_blocked": assistant["is_blocked"]}


def delete_assistant(business_id: str, assistant_id: int) -> dict:
    _get_assistant_or_404(business_id, assistant_id)

    # invoices.assistant_id ahora es ON DELETE SET NULL (ver migración
    # 09_assistants_delete_policy.sql) — el borrado no falla aunque el
    # asistente ya tenga ventas. El nombre de esas ventas NO se pierde: quedó
    # guardado como texto en invoices.assistant_name en el momento de la venta
    # (ver sales_service.create_quick_sale), independiente de esta fila.
    try:
        supabase_admin.table("business_assistants")\
            .delete()\
            .eq("id", assistant_id)\
            .eq("business_id", business_id)\
            .execute()
    except Exception as e:
        msg = str(e).lower()
        if "foreign key" in msg or "23503" in msg:
            # Solo puede pasar si la migración que cambia la FK a
            # ON DELETE SET NULL todavía no se aplicó en la base de datos.
            raise ValueError(
                "No se puede eliminar: falta aplicar la migración que permite "
                "borrar asistentes con ventas registradas (ver 09_assistants_delete_policy.sql)."
            )
        raise

    return {"deleted": True}
