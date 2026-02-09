"""
Tag endpoints - CRUD operations for tags
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from db import get_session
from middleware.auth import get_current_user
from models import User
from schemas import TagCreate, TagUpdate, TagPublic
from services import tag_service
from exceptions import NotFoundError, ValidationError

router = APIRouter(prefix="/api/tags", tags=["Tags"])


def tag_to_dict(tag) -> dict:
    """Convert tag to dict with JSON-serializable values"""
    tag_dict = tag.model_dump()
    tag_dict['id'] = str(tag_dict['id'])
    tag_dict['user_id'] = str(tag_dict['user_id'])
    tag_dict['created_at'] = tag_dict['created_at'].isoformat()
    return tag_dict


@router.get("")
async def list_tags(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all tags for the authenticated user

    - Returns tags sorted alphabetically by name
    """
    tags = tag_service.list_tags(session=session, user=current_user)
    return [tag_to_dict(tag) for tag in tags]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new tag

    - **name**: Tag name (required, 1-50 characters)
    - **color**: Tag color in hex format (default: #3B82F6 blue)
    """
    try:
        tag = tag_service.create_tag(
            session=session,
            user=current_user,
            name=tag_data.name,
            color=tag_data.color
        )
        return tag_to_dict(tag)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": e.message}
        )


@router.get("/{tag_id}")
async def get_tag(
    tag_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific tag by ID

    Only returns tags that belong to the authenticated user
    """
    try:
        tag = tag_service.get_tag_by_id(session=session, tag_id=tag_id, user=current_user)
        return tag_to_dict(tag)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )


@router.put("/{tag_id}")
async def update_tag(
    tag_id: UUID,
    tag_data: TagUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a tag

    - **name**: Optional new name (1-50 characters)
    - **color**: Optional new color in hex format
    """
    try:
        tag = tag_service.update_tag(
            session=session,
            tag_id=tag_id,
            user=current_user,
            name=tag_data.name,
            color=tag_data.color
        )
        return tag_to_dict(tag)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": e.message}
        )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a tag

    Only deletes tags that belong to the authenticated user
    """
    try:
        tag_service.delete_tag(session=session, tag_id=tag_id, user=current_user)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": e.message}
        )
