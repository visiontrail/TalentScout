from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.models import User, Task, Candidate
from app.api.routes.auth import get_current_active_user
from pydantic import BaseModel

router = APIRouter(prefix="/tasks", tags=["tasks"])

# 任务创建模型
class TaskCreate(BaseModel):
    task_name: str
    job_description: str

# 任务信息模型
class TaskInfo(BaseModel):
    id: int
    task_name: str
    job_description: str
    created_at: datetime
    updated_at: datetime
    candidate_count: int = 0

    class Config:
        orm_mode = True

# 候选人创建模型
class CandidateCreate(BaseModel):
    name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    contact: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    ai_score: Optional[int] = None
    source_platform: str
    resume_text: Optional[str] = None

# 候选人信息模型
class CandidateInfo(BaseModel):
    id: int
    task_id: int
    name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    contact: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    ai_score: Optional[int] = None
    source_platform: str
    resume_text: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

# 批量创建候选人模型
class BatchCandidateCreate(BaseModel):
    candidates: List[CandidateCreate]

# 获取任务列表
@router.get("/", response_model=List[TaskInfo])
async def get_tasks(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    
    # 计算每个任务的候选人数量
    result = []
    for task in tasks:
        candidate_count = db.query(Candidate).filter(Candidate.task_id == task.id).count()
        task_dict = {
            "id": task.id,
            "task_name": task.task_name,
            "job_description": task.job_description,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "candidate_count": candidate_count
        }
        result.append(task_dict)
    
    return result

# 创建任务
@router.post("/", response_model=TaskInfo, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_task = Task(
        user_id=current_user.id,
        task_name=task.task_name,
        job_description=task.job_description
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return {
        "id": db_task.id,
        "task_name": db_task.task_name,
        "job_description": db_task.job_description,
        "created_at": db_task.created_at,
        "updated_at": db_task.updated_at,
        "candidate_count": 0
    }

# 获取任务详情
@router.get("/{task_id}", response_model=TaskInfo)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    candidate_count = db.query(Candidate).filter(Candidate.task_id == task.id).count()
    
    return {
        "id": task.id,
        "task_name": task.task_name,
        "job_description": task.job_description,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "candidate_count": candidate_count
    }

# 更新任务
@router.put("/{task_id}", response_model=TaskInfo)
async def update_task(
    task_id: int,
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.task_name = task.task_name
    db_task.job_description = task.job_description
    db_task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_task)
    
    candidate_count = db.query(Candidate).filter(Candidate.task_id == db_task.id).count()
    
    return {
        "id": db_task.id,
        "task_name": db_task.task_name,
        "job_description": db_task.job_description,
        "created_at": db_task.created_at,
        "updated_at": db_task.updated_at,
        "candidate_count": candidate_count
    }

# 删除任务
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # 删除任务关联的所有候选人
    db.query(Candidate).filter(Candidate.task_id == task_id).delete()
    
    # 删除任务
    db.delete(db_task)
    db.commit()
    
    return None

# 获取任务的候选人列表
@router.get("/{task_id}/candidates", response_model=List[CandidateInfo])
async def get_task_candidates(
    task_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 验证任务存在且属于当前用户
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    candidates = db.query(Candidate).filter(Candidate.task_id == task_id).offset(skip).limit(limit).all()
    return candidates

# 添加候选人
@router.post("/{task_id}/candidates", response_model=CandidateInfo, status_code=status.HTTP_201_CREATED)
async def add_candidate(
    task_id: int,
    candidate: CandidateCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 验证任务存在且属于当前用户
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_candidate = Candidate(
        task_id=task_id,
        name=candidate.name,
        gender=candidate.gender,
        age=candidate.age,
        contact=candidate.contact,
        education=candidate.education,
        experience=candidate.experience,
        ai_score=candidate.ai_score,
        source_platform=candidate.source_platform,
        resume_text=candidate.resume_text
    )
    
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    
    return db_candidate

# 批量添加候选人
@router.post("/{task_id}/candidates/batch", response_model=List[CandidateInfo], status_code=status.HTTP_201_CREATED)
async def add_candidates_batch(
    task_id: int,
    batch: BatchCandidateCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 验证任务存在且属于当前用户
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_candidates = []
    for candidate_data in batch.candidates:
        db_candidate = Candidate(
            task_id=task_id,
            name=candidate_data.name,
            gender=candidate_data.gender,
            age=candidate_data.age,
            contact=candidate_data.contact,
            education=candidate_data.education,
            experience=candidate_data.experience,
            ai_score=candidate_data.ai_score,
            source_platform=candidate_data.source_platform,
            resume_text=candidate_data.resume_text
        )
        db.add(db_candidate)
        db_candidates.append(db_candidate)
    
    db.commit()
    for candidate in db_candidates:
        db.refresh(candidate)
    
    return db_candidates