from pydantic import BaseSettings
from typing import Optional, List
import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "TalentScout"
    
    # JWT相关配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./talentscout.db?check_same_thread=False")
    
    # AI模型配置
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-3.5-turbo")
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    class Config:
        case_sensitive = True

settings = Settings()