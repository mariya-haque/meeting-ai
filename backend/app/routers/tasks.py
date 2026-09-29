from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _get_owned_task(db: Session, task_id: int, user: models.User) -> models.Task:
    task = db.get(models.Task, task_id)
    if not task or task.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    status: str | None = None,
    meeting_id: int | None = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    stmt = select(models.Task).where(models.Task.owner_id == user.id)
    if status:
        stmt = stmt.where(models.Task.status == status)
    if meeting_id:
        stmt = stmt.where(models.Task.meeting_id == meeting_id)
    stmt = stmt.order_by(models.Task.due_date.asc().nullslast(), models.Task.id.desc())
    return db.scalars(stmt).all()


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    task = models.Task(owner_id=user.id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    task = _get_owned_task(db, task_id, user)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/complete", response_model=schemas.TaskOut)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    task = _get_owned_task(db, task_id, user)
    task.status = "completed"
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    task = _get_owned_task(db, task_id, user)
    db.delete(task)
    db.commit()
