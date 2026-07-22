from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

# backend/.env, calculado a partir de la ubicación de este archivo
# (backend/app/config.py) para que funcione sin importar desde qué
# directorio se lance el proceso (antes usaba "../.env", una ruta
# relativa al cwd que rompía según se ejecutara desde la raíz del
# proyecto o desde backend/).
BACKEND_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    # Zona horaria fija de la app (mercado objetivo: Panamá, ver docs/product/PRD.md).
    # El proyecto no tiene soporte multi-timezone por negocio — se usa esta
    # constante para interpretar el horario de ventas (sales_opening_time/
    # sales_closing_time) contra la hora actual.
    app_timezone: str = "America/Panama"

    model_config = {"env_file": str(BACKEND_ENV_FILE), "extra": "ignore"}

settings = Settings()