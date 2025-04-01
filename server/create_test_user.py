from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.models import User, Base
from app.core.security import get_password_hash

def create_test_user():
    # 确保数据库表存在
    Base.metadata.create_all(bind=engine)
    
    # 创建数据库会话
    db = SessionLocal()
    
    try:
        # 检查测试用户是否已存在
        test_user = db.query(User).filter(User.username == "testuser").first()
        
        if not test_user:
            # 创建测试用户
            new_user = User(
                username="testuser",
                email="test@example.com",
                password_hash=get_password_hash("password"),
                subscription_level="free",
                is_active=True
            )
            
            db.add(new_user)
            db.commit()
            print("测试用户已创建成功:")
            print(f"用户名: testuser")
            print(f"密码: password")
        else:
            print("测试用户已存在")
            print(f"用户名: testuser")
            print(f"密码: password")
    
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user() 