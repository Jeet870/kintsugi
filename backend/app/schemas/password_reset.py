"""
Pydantic Schemas for Password Reset Flow.
Defines strict request/response data models for forgot password, OTP verification, and password reset.
"""
from pydantic import BaseModel, EmailStr, Field


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="User account email address")


class ForgotPasswordResponse(BaseModel):
    success: bool = Field(True)
    message: str = Field("If an account exists, a verification code has been sent.")


class VerifyResetOtpRequest(BaseModel):
    email: EmailStr = Field(..., description="User account email address")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit numeric OTP code")


class VerifyResetOtpResponse(BaseModel):
    verified: bool = Field(True)
    reset_token: str = Field(..., description="Temporary 10-minute JWT token for password reset")


class ResetPasswordRequest(BaseModel):
    reset_token: str = Field(..., description="Temporary reset JWT token issued upon OTP verification")
    new_password: str = Field(..., min_length=12, description="New password meeting complexity rules")


class ResetPasswordResponse(BaseModel):
    success: bool = Field(True)
    message: str = Field("Password updated successfully.")
