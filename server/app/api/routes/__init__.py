# 初始化路由包
from app.api.routes import auth, users, ai, tasks

# 导出所有路由模块，使其可以被导入
__all__ = ["auth", "users", "ai", "tasks"]