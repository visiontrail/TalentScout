from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    subscription_level = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # 关系
    api_keys = relationship("ApiKey", back_populates="user")
    tasks = relationship("Task", back_populates="user")

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    api_key = Column(String)
    valid_until = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="api_keys")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    task_name = Column(String)
    job_description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    user = relationship("User", back_populates="tasks")
    candidates = relationship("Candidate", back_populates="task")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    name = Column(String)
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    contact = Column(String, nullable=True)
    education = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    ai_score = Column(Integer, nullable=True)
    source_platform = Column(String)
    resume_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    task = relationship("Task", back_populates="candidates")