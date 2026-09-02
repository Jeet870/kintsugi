"""
Authentication Router.
Exposes endpoints for user registration, OAuth2 password login, refresh token rotation, and logout revocation.
Delegates all business logic exclusively to AuthService.
"""
from fastapi import APIRouter, Depends, status, Request, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, sensitive_rate_limiter
from app.schemas.user import UserCreate, UserOut, TokenPair, RefreshTokenRequest, OAuth2LoginRequest, GitHubCodeExchangeRequest
from app.services.auth_service import auth_service
from app.core.config import settings

router = APIRouter()


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    dependencies=[Depends(sensitive_rate_limiter)],
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> UserOut:
    """
    Registers a new user account with validated email and password complexity.
    """
    return auth_service.register_user(db, user_in=user_in)


@router.post(
    "/login",
    response_model=TokenPair,
    summary="Authenticate user and issue token pair",
    dependencies=[Depends(sensitive_rate_limiter)],
)
async def login(
    request: Request,
    db: Session = Depends(get_db),
) -> TokenPair:
    """
    OAuth2 / JSON compatible password login flow. Validates credentials and returns JWT access & refresh tokens.
    Supports both JSON body ({'email': '...', 'password': '...'}) and Form Data ({'username': '...', 'password': '...'}).
    """
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form_data = await request.form()
            email = form_data.get("username") or form_data.get("email")
            password = form_data.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Both email and password fields are required for authentication.",
        )

    user = auth_service.authenticate_user(
        db, email=email, password=password
    )
    return auth_service.issue_token_pair(db, user=user)


@router.get(
    "/oauth/config",
    summary="Retrieve public OAuth client IDs for Google and GitHub",
)
def get_oauth_config() -> dict:
    """
    Returns public OAuth client IDs configured on the backend server.
    """
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID,
        "github_client_id": settings.GITHUB_CLIENT_ID,
    }


@router.post(
    "/oauth/login",
    response_model=TokenPair,
    summary="Authenticate user via OAuth2 provider (Google, GitHub)",
    dependencies=[Depends(sensitive_rate_limiter)],
)
def oauth_login(
    oauth_in: OAuth2LoginRequest,
    db: Session = Depends(get_db),
) -> TokenPair:
    """
    OAuth2 Social Authentication flow. Accepts provider token (Google ID token or GitHub Access token),
    authenticates or provisions user account, and issues JWT access & refresh tokens.
    """
    user = auth_service.authenticate_oauth_user(
        db,
        provider=oauth_in.provider,
        token=oauth_in.token,
        email=oauth_in.email,
        name=oauth_in.name,
        avatar_url=oauth_in.avatar_url,
        provider_id=oauth_in.provider_id,
    )
    return auth_service.issue_token_pair(db, user=user)


@router.post(
    "/oauth/github/code",
    response_model=TokenPair,
    summary="Exchange GitHub authorization code for user session",
    dependencies=[Depends(sensitive_rate_limiter)],
)
def github_code_exchange(
    req: GitHubCodeExchangeRequest,
    db: Session = Depends(get_db),
) -> TokenPair:
    """
    Exchanges GitHub OAuth authorization code for verified user session.
    """
    user = auth_service.exchange_github_code(db, code=req.code)
    return auth_service.issue_token_pair(db, user=user)




@router.post(
    "/refresh",
    response_model=TokenPair,
    summary="Rotate refresh token and issue new token pair",
)
def refresh_token(
    refresh_in: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> TokenPair:
    """
    Validates provided refresh token, revokes previous token, and issues a fresh token pair.
    """
    return auth_service.refresh_access_token(db, refresh_token=refresh_in.refresh_token)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke refresh token and end session",
)
def logout(
    refresh_in: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> None:
    """
    Revokes the provided refresh token, preventing future session reuse.
    """
    auth_service.revoke_refresh_token(db, refresh_token=refresh_in.refresh_token)
    return None


# =============================================================================
# Password Reset Endpoints
# =============================================================================

from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyResetOtpRequest,
    VerifyResetOtpResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.services.password_reset_service import password_reset_service


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Request password reset OTP",
    dependencies=[Depends(sensitive_rate_limiter)],
)
def forgot_password(
    req: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> ForgotPasswordResponse:
    """
    Generates 6-digit numeric OTP, saves SHA256 hash, and emails code.
    Returns generic success message to prevent user enumeration.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    res = password_reset_service.request_otp(
        db, email=req.email, ip_address=ip_address, user_agent=user_agent
    )
    return ForgotPasswordResponse(**res)


@router.post(
    "/verify-reset-otp",
    response_model=VerifyResetOtpResponse,
    summary="Verify password reset OTP and issue reset token",
    dependencies=[Depends(sensitive_rate_limiter)],
)
def verify_reset_otp(
    req: VerifyResetOtpRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> VerifyResetOtpResponse:
    """
    Validates OTP code. On success, issues a temporary 10-minute JWT reset token.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    res = password_reset_service.verify_otp(
        db, email=req.email, otp=req.otp, ip_address=ip_address, user_agent=user_agent
    )
    return VerifyResetOtpResponse(**res)


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    summary="Reset password using verified reset token",
    dependencies=[Depends(sensitive_rate_limiter)],
)
def reset_password(
    req: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> ResetPasswordResponse:
    """
    Updates user password, checks password history (last 5 passwords),
    revokes all active sessions, and sends email notification.
    """
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    res = password_reset_service.reset_password(
        db,
        reset_token=req.reset_token,
        new_password=req.new_password,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    return ResetPasswordResponse(**res)

