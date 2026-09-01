from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_db, get_current_user_optional, get_current_active_user
from app.core.constants import ContentType
from app.models.content_item import ContentItem
from app.models.daily_motivation import DailyMotivation
from app.models.user import User
from app.schemas.content import ContentItemOut
from app.schemas.daily_motivation import DailyMotivationOut, ContentDtoOut
from app.services.ai_service import ai_service

router = APIRouter()


@router.get(
    "/daily",
    response_model=DailyMotivationOut,
    summary="Get or automatically generate today's content for authenticated user",
)
def get_or_create_daily_motivation(
    date_str: Optional[str] = Query(None, description="Optional target date YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> DailyMotivationOut:
    """
    Get-or-Create pattern for Daily Motivation:
    1. Checks if target date's record exists for the user in SQLite database.
    2. If found, returns saved content immediately.
    3. If NOT found, automatically generates AI content, saves once to DB, and returns it.
    """
    user_id = current_user.id if current_user else 1

    if date_str and isinstance(date_str, str):
        try:
            today = date.fromisoformat(date_str)
        except ValueError:
            today = datetime.now().date()
    else:
        today = datetime.now().date()

    # 1. Check existing record for user & date
    stmt = select(DailyMotivation).where(
        DailyMotivation.user_id == user_id,
        DailyMotivation.content_date == today,
    )
    existing_record = db.scalars(stmt).first()

    if not existing_record:
        # 2. Automatically generate today's content via AI Service in a single call
        try:
            bundle = ai_service.generate_full_daily_bundle()
            new_record = DailyMotivation(
                user_id=user_id,
                content_date=today,
                quote=bundle["quote"],
                quote_author=bundle.get("quote_author", "Kintsugi AI"),
                quote_category=bundle.get("quote_category", "hope"),
                affirmations=bundle["affirmations"],
                self_care_tips=bundle["self_care_tips"],
            )
            db.add(new_record)
            db.commit()
            db.refresh(new_record)
            existing_record = new_record
        except IntegrityError:
            # Prevent duplicate generation across concurrent tabs/devices
            db.rollback()
            existing_record = db.scalars(stmt).first()
        except Exception as err:
            db.rollback()
            existing_record = db.scalars(stmt).first()
            if not existing_record:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Today's inspiration is being prepared. Please try again shortly.",
                )

    # Fallback safety if DB read returns None
    if not existing_record:
        existing_record = DailyMotivation(
            id=1,
            user_id=user_id,
            content_date=today,
            quote="The wound is the place where the Light enters you.",
            quote_author="Rumi",
            quote_category="hope",
            affirmations=[
                {"text": "Like Kintsugi, my scars and struggles make me stronger, unique, and resilient.", "category": "resilience"},
                {"text": "I am growing and evolving every single day, one step at a time.", "category": "growth"},
                {"text": "I give myself permission to rest and recharge without any guilt.", "category": "self-compassion"},
            ],
            self_care_tips=[
                {"text": "Pause, inhale, exhale. Reset your mind and body with 5 slow deep breaths.", "category": "mindfulness"},
                {"text": "Hydration is self-care. Drink a fresh glass of water right now.", "category": "wellness"},
                {"text": "A little movement can lift your mood and clear your mind. Go for a short walk.", "category": "activity"},
            ],
        )

    # Convert to response payload schema
    quote_text = existing_record.quote
    author_suffix = f" — {existing_record.quote_author}" if existing_record.quote_author and " — " not in quote_text else ""
    
    quote_out = ContentItemOut(
        id=existing_record.id * 10,
        type=ContentType.QUOTE,
        text=f"{quote_text}{author_suffix}",
        category=existing_record.quote_category or "hope",
    )

    aff_out = [
        ContentItemOut(
            id=existing_record.id * 10 + idx,
            type=ContentType.AFFIRMATION,
            text=a.get("text", "") if isinstance(a, dict) else str(a),
            category=a.get("category", "resilience") if isinstance(a, dict) else "resilience",
        )
        for idx, a in enumerate(existing_record.affirmations or [], start=1)
    ]

    tips_out = [
        ContentItemOut(
            id=existing_record.id * 100 + idx,
            type=ContentType.TIP,
            text=t.get("text", "") if isinstance(t, dict) else str(t),
            category=t.get("category", "mindfulness") if isinstance(t, dict) else "mindfulness",
        )
        for idx, t in enumerate(existing_record.self_care_tips or [], start=1)
    ]

    return DailyMotivationOut(
        id=existing_record.id,
        user_id=user_id,
        content_date=existing_record.content_date,
        quote=quote_out,
        affirmations=aff_out,
        tips=tips_out,
    )


@router.get(
    "/quote",
    response_model=ContentItemOut,
    summary="Get rotating daily motivational quote via Quotable API or DB",
)
def get_daily_quote(
    random: Optional[bool] = Query(False, description="If true, returns a random quote instead of deterministic daily quote"),
    db: Session = Depends(get_db),
) -> ContentItemOut:
    """
    Fetches live quotes from Quotable API (https://api.quotable.io/random) with database fallback.
    """
    import urllib.request
    import json

    # 1. Try Quotable API
    try:
        url = "https://api.quotable.io/quotes/random" if random else "https://api.quotable.io/random"
        req = urllib.request.Request(url, headers={"User-Agent": "Kintsugi/1.0"})
        with urllib.request.urlopen(req, timeout=3) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                quote_obj = data[0] if isinstance(data, list) and data else data
                if quote_obj and "content" in quote_obj:
                    quote_text = quote_obj["content"]
                    author = quote_obj.get("author", "Anonymous")
                    tags = quote_obj.get("tags", [])
                    category = tags[0] if tags else "inspiration"
                    return ContentItemOut(
                        id=1,
                        type=ContentType.QUOTE,
                        text=f"{quote_text} — {author}",
                        category=category,
                    )
    except Exception:
        pass

    # 2. Database Fallback
    import random as random_module
    stmt = select(ContentItem).where(
        ContentItem.type == ContentType.QUOTE,
        ContentItem.is_active == True,
    ).order_by(ContentItem.id.asc())

    quotes = list(db.scalars(stmt).all())
    if not quotes:
        return ContentItemOut(
            id=0,
            type=ContentType.QUOTE,
            text="Every day is a fresh beginning; take a deep breath and start again. — Unknown",
            category="daily",
        )

    if random:
        return random_module.choice(quotes)

    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    selected_quote = quotes[day_of_year % len(quotes)]
    return selected_quote


@router.get(
    "/tips",
    response_model=List[ContentItemOut],
    summary="Get active self-care tips",
)
def get_self_care_tips(
    category: Optional[str] = Query(None, description="Optional category filter (e.g., 'mindfulness', 'rest')"),
    db: Session = Depends(get_db),
) -> List[ContentItemOut]:
    """
    Retrieves active self-care tips from the content catalog or generates fresh AI tips.
    """
    stmt = select(ContentItem).where(
        ContentItem.type == ContentType.TIP,
        ContentItem.is_active == True,
    )
    if category:
        stmt = stmt.where(ContentItem.category == category.lower())

    tips = list(db.scalars(stmt).all())
    if not tips:
        from app.services.ai_service import ai_service
        ai_tips = ai_service.generate_ai_self_care_tips(count=5)
        new_items = []
        for idx, t in enumerate(ai_tips, start=1):
            item = ContentItem(
                id=100 + idx,
                type=ContentType.TIP,
                text=t["text"],
                category=t["category"],
                is_active=True,
            )
            new_items.append(item)
        return new_items

    return tips


@router.get(
    "/",
    response_model=List[ContentItemOut],
    summary="Get daily motivation and self-care content items",
    include_in_schema=False,
)
def get_wellness_content(
    item_type: Optional[ContentType] = Query(None, description="Optional content type filter ('quote', 'affirmation', 'tip')"),
    db: Session = Depends(get_db),
) -> List[ContentItemOut]:
    """
    Retrieves active daily quotes, affirmations, and self-care tips for display on the Daily Motivation screen.
    """
    stmt = select(ContentItem).where(ContentItem.is_active == True)
    if item_type:
        stmt = stmt.where(ContentItem.type == item_type)
    
    items = list(db.scalars(stmt).all())
    if not items and item_type == ContentType.AFFIRMATION:
        from app.services.ai_service import ai_service
        ai_affs = ai_service.generate_ai_affirmations(count=5)
        return [
            ContentItemOut(
                id=10 + idx,
                type=ContentType.AFFIRMATION,
                text=a["text"],
                category=a["category"],
            )
            for idx, a in enumerate(ai_affs, start=1)
        ]

    return items


@router.get(
    "/motivation",
    response_model=ContentDtoOut,
    summary="Get daily motivation content formatted for Android client",
)
def get_daily_motivation_mobile(
    date_str: Optional[str] = Query(None, description="Optional target date YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> ContentDtoOut:
    """
    Retrieves today's motivational bundle matching the Android ContentDto schema.
    """
    daily = get_or_create_daily_motivation(date_str=date_str, db=db, current_user=current_user)
    
    quote_raw = daily.quote.text
    quote_text = quote_raw
    author = "Kintsugi Philosophy"
    if " — " in quote_raw:
        parts = quote_raw.split(" — ", 1)
        quote_text = parts[0].strip()
        author = parts[1].strip()

    def extract_text(item) -> str:
        if hasattr(item, "text"):
            return item.text
        if isinstance(item, dict):
            return item.get("text", str(item))
        return str(item)

    affs = [extract_text(a) for a in (daily.affirmations or [])]
    tips = [extract_text(t) for t in (daily.tips or [])]

    return ContentDtoOut(
        quote=quote_text,
        author=author,
        affirmations=affs,
        self_care_tips=tips,
    )


@router.get(
    "/affirmations",
    response_model=List[str],
    summary="Get daily affirmations list for Android client",
)
def get_affirmations_mobile(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> List[str]:
    """
    Retrieves today's affirmation strings list.
    """
    daily = get_or_create_daily_motivation(date_str=None, db=db, current_user=current_user)
    
    def extract_text(item) -> str:
        if hasattr(item, "text"):
            return item.text
        if isinstance(item, dict):
            return item.get("text", str(item))
        return str(item)

    return [extract_text(a) for a in (daily.affirmations or [])]


