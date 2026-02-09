"""
Tag service - business logic for tag management
"""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select
from uuid import UUID

from models import Tag, User
from exceptions import NotFoundError, ValidationError


def create_tag(session: Session, user: User, name: str, color: str = "#3B82F6") -> Tag:
    """
    Create a new tag for a user

    Args:
        session: Database session
        user: User object (owner of the tag)
        name: Tag name
        color: Tag color (hex code)

    Returns:
        Created Tag object
    """
    # Check if tag with same name already exists for user
    existing_tag = session.exec(
        select(Tag).where(Tag.user_id == user.id).where(Tag.name == name)
    ).first()

    if existing_tag:
        raise ValidationError(f"Tag '{name}' already exists")

    tag = Tag(
        user_id=user.id,
        name=name,
        color=color
    )

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag


def list_tags(session: Session, user: User) -> List[Tag]:
    """
    List all tags for a user

    Args:
        session: Database session
        user: User object

    Returns:
        List of Tag objects sorted by name
    """
    query = select(Tag).where(Tag.user_id == user.id).order_by(Tag.name)

    return list(session.exec(query).all())


def get_tag_by_id(session: Session, tag_id: UUID, user: User) -> Tag:
    """
    Get a specific tag by ID, verifying user ownership

    Args:
        session: Database session
        tag_id: Tag UUID
        user: User object (for ownership verification)

    Returns:
        Tag object

    Raises:
        NotFoundError: If tag not found or doesn't belong to user
    """
    tag = session.get(Tag, tag_id)

    if not tag or tag.user_id != user.id:
        raise NotFoundError("Tag")

    return tag


def update_tag(session: Session, tag_id: UUID, user: User,
                name: Optional[str] = None,
                color: Optional[str] = None) -> Tag:
    """
    Update a tag

    Args:
        session: Database session
        tag_id: Tag UUID
        user: User object (for ownership verification)
        name: Optional new name
        color: Optional new color

    Returns:
        Updated Tag object

    Raises:
        NotFoundError: If tag not found or doesn't belong to user
        ValidationError: If new name conflicts with existing tag
    """
    tag = get_tag_by_id(session, tag_id, user)

    if name is not None:
        # Check if new name conflicts with existing tag
        existing_tag = session.exec(
            select(Tag).where(Tag.user_id == user.id).where(Tag.name == name).where(Tag.id != tag_id)
        ).first()

        if existing_tag:
            raise ValidationError(f"Tag '{name}' already exists")

        tag.name = name

    if color is not None:
        tag.color = color

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag


def delete_tag(session: Session, tag_id: UUID, user: User) -> None:
    """
    Delete a tag

    Args:
        session: Database session
        tag_id: Tag UUID
        user: User object (for ownership verification)

    Raises:
        NotFoundError: If tag not found or doesn't belong to user
    """
    tag = get_tag_by_id(session, tag_id, user)

    session.delete(tag)
    session.commit()
