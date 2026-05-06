from typing import Any

from sqlalchemy import inspect
from sqlalchemy.ext.automap import automap_base

from app.db.session import engine

AutomapBase = automap_base()
AutomapBase.prepare(autoload_with=engine)


def get_model(table_name: str) -> Any:
    classes = AutomapBase.classes
    if not hasattr(classes, table_name):
        raise ValueError(f"Table '{table_name}' is not mapped in the current database")
    return getattr(classes, table_name)


def has_column(model: Any, column_name: str) -> bool:
    mapper = inspect(model)
    return any(column.key == column_name for column in mapper.columns)
