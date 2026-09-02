import pytest
from unittest.mock import patch, MagicMock

from app.models import Base
from app.services.auth_service import auth_service
from app.core.exceptions import UnauthorizedException


def test_oauth_login_without_token_fails(db_session):
    with pytest.raises(UnauthorizedException) as exc_info:
        auth_service.authenticate_oauth_user(
            db_session,
            provider="google",
            token="",
            email="test@gmail.com",
        )
    assert "OAuth2 authentication requires a valid OAuth token" in str(exc_info.value)


def test_oauth_login_with_invalid_google_token_fails(db_session):
    with patch("httpx.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.text = "Invalid Value"
        mock_get.return_value = mock_resp

        with pytest.raises(UnauthorizedException) as exc_info:
            auth_service.authenticate_oauth_user(
                db_session,
                provider="google",
                token="invalid_token_xyz",
            )
        assert "Invalid or expired Google OAuth credential" in str(exc_info.value)


def test_oauth_login_with_verified_google_token_succeeds(db_session):
    with patch("httpx.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "email": "verified.user@gmail.com",
            "name": "Verified User",
            "picture": "https://lh3.googleusercontent.com/a/abc",
            "email_verified": True,
        }
        mock_get.return_value = mock_resp

        user = auth_service.authenticate_oauth_user(
            db_session,
            provider="google",
            token="valid_google_id_token",
        )

        assert user.email == "verified.user@gmail.com"
        assert user.name == "Verified User"
        assert user.avatar_url == "https://lh3.googleusercontent.com/a/abc"
