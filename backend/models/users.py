from database.database import db
import enum
import datetime
from sqlalchemy import Enum as SQLAlchemyEnum

# Enums
class UserType(enum.Enum):
    employee = "employee"
    employer = "employer"
    admin = "admin"

# Models
class Users(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    user_type = db.Column(SQLAlchemyEnum(UserType), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)



