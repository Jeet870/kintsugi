"""
Emergency & Crisis Escalation Schemas.
Defines API request and response contracts for emergency helpline resources and crisis escalation payloads.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class HelplineResourceOut(BaseModel):
    """
    Response schema for emergency helpline resources.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Unique helpline resource ID")
    country_code: str = Field("IN", description="ISO country code")
    name: str = Field(..., description="Name of the helpline organization or service")
    phone_number: str = Field(..., description="Contact phone number")
    description: Optional[str] = Field(None, description="Brief description of the service")
    available_hours: Optional[str] = Field(None, description="Operating hours (e.g. 24/7)")
    is_active: bool = Field(True, description="Active status flag")


# Alias for backward compatibility
EmergencyResourceResponse = HelplineResourceOut


class EmergencyEscalation(BaseModel):
    """
    Crisis escalation payload returned when safety triggers are detected.
    Carries non-clinical, supportive guidance and relevant helpline contacts.
    """
    model_config = ConfigDict(from_attributes=True)

    reason: str = Field(..., description="Trigger reason for safety escalation")
    message: str = Field(..., description="Supportive, non-clinical intervention message")
    recommended_helplines: List[HelplineResourceOut] = Field(
        default_factory=list,
        description="List of relevant helpline contacts",
    )


class CrisisAlertRequest(BaseModel):
    """
    Request schema for reporting crisis events from client or workers.
    """
    trigger_source: str = Field(..., description="Source of crisis trigger (e.g. chat, journal, mood)")
    flagged_content: str = Field(..., description="Flagged text content")
    severity: Optional[str] = Field("high", description="Assessed severity level")


class CalmingTipOut(BaseModel):
    """
    Response schema for static calming guidance exercises.
    """
    id: str = Field(..., description="Unique technique identifier")
    title: str = Field(..., description="Technique title")
    category: str = Field(..., description="Category ('breathing', 'grounding', 'coping')")
    description: str = Field(..., description="Coping exercise summary")
    steps: List[str] = Field(default_factory=list, description="Step-by-step guidance instructions")
