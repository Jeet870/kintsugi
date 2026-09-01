"""
Date & Time Utilities.
Centralizes timezone-aware datetime generation, local calendar date calculations using zoneinfo,
and day-difference calculations for streak continuity logic.
"""
from typing import Union
from datetime import datetime, date, timezone
from zoneinfo import ZoneInfo


def utcnow() -> datetime:
    """
    Returns current timezone-aware UTC datetime instance.
    """
    return datetime.now(timezone.utc)


# Alias for backward compatibility
get_utc_now = utcnow


def local_today(tz: Union[str, ZoneInfo] = "UTC") -> date:
    """
    Returns today's local date for the specified timezone string or ZoneInfo object.
    Defaults to UTC if unrecognized.
    """
    if isinstance(tz, str):
        try:
            zone_obj = ZoneInfo(tz)
        except Exception:
            zone_obj = timezone.utc
    else:
        zone_obj = tz

    return datetime.now(zone_obj).date()


def days_between(
    date_a: Union[date, datetime], date_b: Union[date, datetime]
) -> int:
    """
    Calculates absolute difference in calendar days between two dates or datetimes.
    """
    d_a = date_a.date() if isinstance(date_a, datetime) else date_a
    d_b = date_b.date() if isinstance(date_b, datetime) else date_b
    return abs((d_b - d_a).days)


def format_iso_timestamp(dt: datetime) -> str:
    """
    Formats a datetime instance into ISO 8601 string format.
    """
    return dt.isoformat()
