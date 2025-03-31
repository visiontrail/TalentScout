from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User
from app.core.security import get_password_hash, verify_password
from app.api.routes.auth import get_current_active_user
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/users", tags=["users"])

# 用户创建模型
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# 用户信息模型
class UserInfo(BaseModel):
    id: int
    username: str
    email: str
    subscription_level: str

    class Config:
        orm_mode = True

# 创建新用户
@router.post("/", response_model=UserInfo, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # 检查邮箱是否已存在
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 创建新用户
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=get_password_hash(user.password),
        subscription_level="free"  # 默认为免费用户
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 获取当前用户信息
@router.get("/me", response_model=UserInfo)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# 更新用户密码
class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str

@router.put("/me/password", response_model=dict)
def update_user_password(
    password_update: UserUpdatePassword,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 验证当前密码
    if not verify_password(password_update.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # 更新密码
    current_user.password_hash = get_password_hash(password_update.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}