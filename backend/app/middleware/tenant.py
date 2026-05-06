from uuid import UUID

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class TenantHeaderMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_paths: set[str] | None = None):
        super().__init__(app)
        self.exempt_paths = exempt_paths or set()

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.exempt_paths:
            return await call_next(request)

        tenant_header = request.headers.get("X-Tenant-ID")
        if not tenant_header:
            return JSONResponse(status_code=400, content={"detail": "X-Tenant-ID header is required"})

        try:
            request.state.tenant_id = str(UUID(tenant_header))
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "X-Tenant-ID must be a valid UUID"})

        return await call_next(request)
