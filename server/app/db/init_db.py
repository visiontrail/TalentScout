from sqlalchemy.orm import Session
from app.db.database import engine
from app.models.models import Base, User
from app.core.security import get_password_hash

# 创建数据库表
def create_tables():
    Base.metadata.create_all(bind=engine)

# 初始化数据库
def init_db(db: Session) -> None:
    # 创建表
    create_tables()
    
    # 检查是否已有管理员用户
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        # 创建管理员用户
        admin_user = User(
            username="admin",
            email="admin@talentscout.com",
            password_hash=get_password_hash("admin"),  # 在生产环境中应使用强密码
            subscription_level="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print("Admin user created")
    else:
        print("Admin user already exists")