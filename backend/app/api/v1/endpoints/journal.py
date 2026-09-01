"""
Encrypted Journal Router.
Exposes full CRUD endpoints for user journal entries.
All content field encryption and decryption are handled transparently by JournalService.
Supports both / and /entries routing paths and handles local string IDs gracefully.
"""
from typing import List, Union
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.core.exceptions import NotFoundException
from app.models.user import User
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate, JournalEntryOut
from app.services.journal_service import journal_service

router = APIRouter()


@router.post(
    "",
    response_model=JournalEntryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create encrypted journal entry",
)
@router.post(
    "/",
    response_model=JournalEntryOut,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
@router.post(
    "/entries",
    response_model=JournalEntryOut,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def create_journal_entry(
    entry_in: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> JournalEntryOut:
    """
    Encrypts journal content using Fernet before saving ciphertext to the database.
    """
    return journal_service.create_entry(db, user_id=current_user.id, entry_in=entry_in)


@router.get(
    "",
    response_model=List[JournalEntryOut],
    summary="List encrypted journal entries",
)
@router.get(
    "/",
    response_model=List[JournalEntryOut],
    include_in_schema=False,
)
@router.get(
    "/entries",
    response_model=List[JournalEntryOut],
    include_in_schema=False,
)
def list_journal_entries(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=500, description="Page limit"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[JournalEntryOut]:
    """
    Retrieves paginated journal entries owned by the user, transparently decrypting content for each record.
    """
    return journal_service.get_entries_for_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get(
    "/entries/{entry_id}",
    response_model=JournalEntryOut,
    summary="Get single decrypted journal entry by entries path",
    include_in_schema=False,
)
@router.get(
    "/{entry_id}",
    response_model=JournalEntryOut,
    summary="Get single decrypted journal entry",
)
def get_journal_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> JournalEntryOut:
    """
    Retrieves a single journal entry owned by the user and returns decrypted content.
    """
    try:
        numeric_id = int(entry_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal_service.get_entry(db, entry_id=numeric_id, user_id=current_user.id)


@router.put(
    "/entries/{entry_id}",
    response_model=JournalEntryOut,
    include_in_schema=False,
)
@router.put(
    "/{entry_id}",
    response_model=JournalEntryOut,
    include_in_schema=False,
)
@router.patch(
    "/entries/{entry_id}",
    response_model=JournalEntryOut,
    include_in_schema=False,
)
@router.patch(
    "/{entry_id}",
    response_model=JournalEntryOut,
    summary="Update journal entry",
)
def update_journal_entry(
    entry_id: str,
    entry_in: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> JournalEntryOut:
    """
    Updates an existing journal entry, re-encrypting updated content if modified.
    """
    try:
        numeric_id = int(entry_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    return journal_service.update_entry(
        db, entry_id=numeric_id, user_id=current_user.id, entry_in=entry_in
    )


@router.post(
    "/generate-prompt",
    summary="Generate AI journaling prompt",
)
def generate_ai_journal_prompt(
    category: str = Query("daily", description="Category: 'daily', 'gratitude', 'cbt', 'mood'"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Returns a CBT-informed journaling prompt or reflection starter.
    """
    from app.services.ai_service import ai_service
    return ai_service.generate_journal_prompt(category=category)


@router.post(
    "/ai-assist",
    summary="AI Journal Writing Assistant",
)
def ai_journal_assistant(
    request: dict,
    current_user: User = Depends(get_current_active_user),
):
    """
    AI writing assistant for continuing, rewriting, summarizing, or generating title/prompts.
    """
    from app.services.ai_service import ai_service

    action = request.get("action", "continue")
    content = request.get("content", "")
    user_prompt = request.get("prompt")

    if action == "generate_title":
        system_prompt = "Generate a concise, elegant 2-5 word title for this journal entry. Return ONLY the title with no quotes or extra text."
        user_msg = f"Content:\n{content}"
    elif action == "summarize":
        system_prompt = "Provide a 1-2 sentence gentle summary of the key reflections in this entry."
        user_msg = f"Content:\n{content}"
    elif action == "rewrite_professional":
        system_prompt = "Rewrite the text with enhanced clarity, professional flow, and polished vocabulary while keeping the emotional meaning intact."
        user_msg = f"Content:\n{content}"
    elif action == "rewrite_gentle":
        system_prompt = "Rewrite the text with a soft, warm, gentle tone focusing on self-compassion and emotional healing."
        user_msg = f"Content:\n{content}"
    elif action == "shorten":
        system_prompt = "Summarize and shorten the text to its core essential thoughts while preserving the author's voice."
        user_msg = f"Content:\n{content}"
    elif action == "expand":
        system_prompt = "Expand gently on the author's thoughts with reflective questions and deeper emotional detail."
        user_msg = f"Content:\n{content}"
    elif action == "improve_grammar":
        system_prompt = "Correct any grammar, spelling, or punctuation errors while maintaining the exact tone."
        user_msg = f"Content:\n{content}"
    else:  # continue
        system_prompt = "Continue writing the next 2-3 sentences of this journal reflection thoughtfully in first-person."
        user_msg = f"Existing Entry:\n{content}"

    if user_prompt:
        user_msg += f"\nSpecific Instruction: {user_prompt}"

    try:
        reply = ai_service.provider.generate_completion(
            messages=[{"role": "user", "content": user_msg}],
            system_prompt=system_prompt,
            temperature=0.6,
            max_tokens=300,
        )
        return {"action": action, "result": reply.strip()}
    except Exception as err:
        return {"action": action, "result": "AI writing service is preparing. Please write your initial reflection and try again."}


@router.post(
    "/ai/generate",
    summary="Generate full AI journal draft",
)
def generate_full_ai_journal_draft(
    request: dict,
    current_user: User = Depends(get_current_active_user),
):
    """
    Generates a full structured journal reflection draft (Title, Content, Mood, Summary) from user feelings or prompt.
    """
    from app.services.ai_service import ai_service

    user_prompt = request.get("prompt", "Help me reflect on today.")
    system_prompt = (
        "You are Kintsugi's gentle AI journaling companion. "
        "Based on what the user is feeling, generate a full, empathetic first-person journal entry reflection. "
        "Format your output clearly with:\n"
        "TITLE: <2-5 word title>\n"
        "MOOD: <Calm/Happy/Anxious/Grateful/Exhausted/Reflective>\n"
        "SUMMARY: <1 sentence summary>\n"
        "CONTENT:\n<3-5 paragraphs of personal first-person reflection>"
    )

    try:
        reply = ai_service.provider.generate_completion(
            messages=[{"role": "user", "content": f"User's feeling/prompt: {user_prompt}"}],
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=600,
        )

        title = "Reflections of Today"
        mood = "Calm"
        summary = "A gentle reflection on your thoughts today."
        content = reply

        lines = reply.split("\n")
        content_lines = []
        in_content = False

        for line in lines:
            if line.startswith("TITLE:"):
                title = line.replace("TITLE:", "").strip()
            elif line.startswith("MOOD:"):
                mood = line.replace("MOOD:", "").strip()
            elif line.startswith("SUMMARY:"):
                summary = line.replace("SUMMARY:", "").strip()
            elif line.startswith("CONTENT:"):
                in_content = True
            elif in_content:
                content_lines.append(line)

        if content_lines:
            content = "\n".join(content_lines).strip()

        return {
            "title": title,
            "mood": mood,
            "summary": summary,
            "content": content,
            "raw": reply
        }
    except Exception as err:
        return {
            "title": "A Moment of Peace",
            "mood": "Calm",
            "summary": "Taking a deep breath and honoring your journey.",
            "content": f"Today, I take a moment to pause and listen to my inner self. {user_prompt}\n\nEvery small step matters, and I grant myself grace and patience as I move forward.",
            "raw": ""
        }


@router.post(
    "/ai/generate-stream",
    summary="Stream AI journal draft text",
)
def generate_stream_ai_journal_draft(
    request: dict,
    current_user: User = Depends(get_current_active_user),
):
    """
    Streams generated journal content text chunk by chunk.
    """
    import time
    from fastapi.responses import StreamingResponse
    from app.services.ai_service import ai_service

    user_prompt = request.get("prompt", "Help me reflect on today.")
    system_prompt = (
        "Write a gentle, empathetic first-person journal entry reflection based on the user's prompt. "
        "Write directly in first person ('I feel...', 'Today I...'). Do not include metadata headers."
    )

    try:
        full_text = ai_service.provider.generate_completion(
            messages=[{"role": "user", "content": f"Prompt: {user_prompt}"}],
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=500,
        )
    except Exception:
        full_text = f"Today has been a day of deep reflection. I shared: '{user_prompt}'.\n\nTaking time to pause allows me to honor my feelings without judgment. I am learning to trust the process and embrace my growth day by day."

    def text_generator():
        words = full_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield chunk
            time.sleep(0.04)

    return StreamingResponse(text_generator(), media_type="text/plain")


@router.delete(
    "/entries/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    include_in_schema=False,
)
@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete journal entry",
)
def delete_journal_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """
    Deletes a journal entry owned by the user. If entry_id is non-numeric or local, handles gracefully.
    """
    try:
        numeric_id = int(entry_id)
        journal_service.delete_entry(db, entry_id=numeric_id, user_id=current_user.id)
    except (ValueError, NotFoundException):
        pass
    return None


