from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from openai import OpenAI
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.models import User, ApiKey
from app.api.routes.auth import get_current_active_user
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

# 简历评分请求模型
class ResumeScoreRequest(BaseModel):
    job_description: str
    resume_text: str

# 简历评分响应模型
class ResumeScoreResponse(BaseModel):
    score: int
    analysis: str

# 获取AI API密钥
@router.get("/key", response_model=dict)
async def get_ai_key(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    # 检查用户是否有有效的API密钥
    api_key = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.valid_until > datetime.utcnow()
    ).first()
    
    # 如果没有有效的API密钥，创建一个临时的
    if not api_key:
        # 在实际应用中，这里应该有更复杂的逻辑来管理API密钥
        # 例如根据用户的订阅级别分配不同的密钥或限制
        
        # 创建一个有效期为1小时的临时密钥
        api_key = ApiKey(
            user_id=current_user.id,
            api_key=settings.DEEPSEEK_API_KEY,  # 在实际应用中应该使用加密存储
            valid_until=datetime.utcnow() + timedelta(hours=1)
        )
        db.add(api_key)
        db.commit()
        db.refresh(api_key)
    
    # 返回临时令牌，而不是实际的API密钥
    # 在实际应用中，可能需要更安全的方式来处理API密钥
    return {"temp_token": str(api_key.id), "valid_until": api_key.valid_until}

# 评分简历
@router.post("/score-resume", response_model=ResumeScoreResponse)
async def score_resume(
    request: ResumeScoreRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 在实际应用中，这里应该验证用户是否有权限使用AI服务
    # 例如检查用户的订阅级别或API使用配额
    
    try:
        # 创建DeepSeek客户端（使用OpenAI兼容接口）
        client = OpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL
        )
        
        # 构建提示
        prompt = f"""请根据以下职位描述评估候选人简历，给出0-100的匹配分数和简要分析：
        
        职位描述：
        {request.job_description}
        
        候选人简历：
        {request.resume_text}
        
        请给出以下格式的回复：
        分数：[0-100之间的数字]
        分析：[简要分析候选人与职位的匹配度，不超过200字]
        """
        
        # 调用DeepSeek API
        response = client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=[
                {"role": "system", "content": "你是一个专业的招聘顾问，擅长评估候选人与职位的匹配度。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        # 解析回复
        ai_response = response.choices[0].message.content.strip()
        
        # 简单解析分数和分析
        score_line = [line for line in ai_response.split('\n') if line.startswith('分数：')]
        analysis_line = [line for line in ai_response.split('\n') if line.startswith('分析：')]
        
        score = 0
        analysis = ""
        
        if score_line:
            try:
                score = int(score_line[0].replace('分数：', '').strip())
            except ValueError:
                score = 0
        
        if analysis_line:
            analysis = analysis_line[0].replace('分析：', '').strip()
            if not analysis and len(ai_response.split('\n')) > 1:
                # 如果没有找到以"分析："开头的行，尝试使用整个回复
                analysis = ai_response
        else:
            analysis = ai_response
        
        return {"score": score, "analysis": analysis}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calling AI service: {str(e)}"
        )