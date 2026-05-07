from app.models.auth import RegisterRequest
from app.services.auth_service import register_business
import asyncio

data = RegisterRequest(
    business_name="Test Business",
    name="Test User",
    email="test_crash123@gmail.com",
    password="password123",
    industry_template_id=None,
    auth_user_id="d1d9a2d3-2f2b-4b2a-8c3b-7a3b3f2f8c5b"
)

try:
    print("Testing register_business...")
    result = register_business(data)
    print("Success!", result)
except Exception as e:
    import traceback
    traceback.print_exc()
