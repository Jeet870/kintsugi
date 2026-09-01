"""
Encrypted Journal Service.
Handles transparent application-level Fernet encryption before persistence and decryption after retrieval.
Generates AI reflections for journal entries using the AI service.
"""
import logging
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.models.journal_entry import JournalEntry
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate
from app.repositories.journal_repository import journal_repository
from app.utils.security_utils import encrypt_content, decrypt_content

logger = logging.getLogger("kintsugi.services.journal")


class JournalService:
    """
    Business service orchestrating encrypted journal entries with AI reflection generation.
    """
    def create_entry(
        self, db: Session, user_id: int, entry_in: JournalEntryCreate
    ) -> JournalEntry:
        """
        Encrypts journal content using Fernet before saving ciphertext to the database.
        Generates an AI reflection for the entry synchronously.
        """
        plaintext_content = entry_in.content
        ciphertext_content = encrypt_content(plaintext_content)

        # Generate AI reflection for the journal entry
        ai_reflection = self._generate_ai_reflection(
            title=entry_in.title,
            content=plaintext_content,
            mood_tag=entry_in.mood_tag
        )

        payload = {
            "title": entry_in.title,
            "content": ciphertext_content,
            "mood_tag": entry_in.mood_tag or "Calm",
            "ai_reflection": ai_reflection,
            "is_favorite": entry_in.is_favorite or False,
            "is_pinned": entry_in.is_pinned or False,
            "is_encrypted": True,
        }

        entry = journal_repository.create_entry(db, user_id=user_id, obj_in=payload)
        logger.info(f"Created encrypted journal entry id={entry.id} for user id={user_id}")

        # Attach decrypted plaintext to return object for service caller
        entry.content = plaintext_content
        return entry

    def update_entry(
        self, db: Session, entry_id: int, user_id: int, entry_in: JournalEntryUpdate
    ) -> JournalEntry:
        """
        Updates an existing journal entry owned by the user, re-encrypting content if changed.
        """
        existing = journal_repository.get_entry(db, entry_id=entry_id, user_id=user_id)
        if not existing:
            raise NotFoundException("Journal entry not found")

        update_payload = {}
        plaintext_override = None

        if entry_in.title is not None:
            update_payload["title"] = entry_in.title
        if entry_in.content is not None:
            plaintext_override = entry_in.content
            update_payload["content"] = encrypt_content(plaintext_override)
            update_payload["is_encrypted"] = True

            # Regenerate AI reflection when content changes
            ai_reflection = self._generate_ai_reflection(
                title=entry_in.title or existing.title,
                content=plaintext_override,
                mood_tag=entry_in.mood_tag or existing.mood_tag
            )
            update_payload["ai_reflection"] = ai_reflection

        if entry_in.mood_tag is not None:
            update_payload["mood_tag"] = entry_in.mood_tag
        if entry_in.is_favorite is not None:
            update_payload["is_favorite"] = entry_in.is_favorite
        if entry_in.is_pinned is not None:
            update_payload["is_pinned"] = entry_in.is_pinned


        updated_entry = journal_repository.update_entry(
            db, entry_id=entry_id, user_id=user_id, obj_in=update_payload
        )
        if not updated_entry:
            raise NotFoundException("Journal entry not found")

        if plaintext_override is not None:
            updated_entry.content = plaintext_override
        else:
            updated_entry.content = decrypt_content(updated_entry.content)

        logger.info(f"Updated journal entry id={entry_id} for user id={user_id}")
        return updated_entry

    def get_entries_for_user(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[JournalEntry]:
        """
        Retrieves paginated journal entries for a user, decrypting content for each record.
        """
        entries = journal_repository.get_by_user(db, user_id=user_id, skip=skip, limit=limit)
        for entry in entries:
            entry.content = decrypt_content(entry.content)
        return entries

    def get_entry(self, db: Session, entry_id: int, user_id: int) -> JournalEntry:
        """
        Retrieves a single journal entry owned by the user and decrypts its content.
        """
        entry = journal_repository.get_entry(db, entry_id=entry_id, user_id=user_id)
        if not entry:
            raise NotFoundException("Journal entry not found")
        entry.content = decrypt_content(entry.content)
        return entry

    def delete_entry(self, db: Session, entry_id: int, user_id: int) -> bool:
        """
        Deletes a journal entry owned by the user.
        """
        success = journal_repository.delete_entry(db, entry_id=entry_id, user_id=user_id)
        if not success:
            raise NotFoundException("Journal entry not found")
        logger.info(f"Deleted journal entry id={entry_id} for user id={user_id}")
        return True

    def _generate_ai_reflection(
        self,
        title: Optional[str],
        content: str,
        mood_tag: Optional[str] = None
    ) -> str:
        """
        Generates an AI reflection for a journal entry using the AI service.
        Returns a fallback message on failure.
        """
        try:
            from app.services.ai_service import ai_service
            return ai_service.generate_journal_reflection(
                title=title,
                content=content,
                mood_tag=mood_tag
            )
        except Exception as err:
            logger.warning(f"AI journal reflection generation failed: {err}")
            return "Your reflection shows real self-awareness. Keep exploring your thoughts — every entry brings you closer to understanding yourself."


journal_service = JournalService()
