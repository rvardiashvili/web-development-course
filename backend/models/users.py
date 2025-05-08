from database.database import db
import enum
import datetime
from sqlalchemy import Enum as SQLAlchemyEnum
from flask_login import UserMixin

# Enums
class UserType(enum.Enum):
    employee = "employee"
    employer = "employer"
    admin = "admin"

class Users(db.Model, UserMixin):
    __tablename__ = 'Users'

    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False)

    # Required by Flask-Login
    is_active = db.Column(db.Boolean, default=True)  # Adding the is_active field
    is_authenticated = db.Column(db.Boolean, default=True)  # Optional, depends on your use case
    is_anonymous = db.Column(db.Boolean, default=False)  # Optional, depends on your use case

    def get_id(self):
        return str(self.user_id)  # Return the user ID as a string, required by Flask-Login

    def __repr__(self):
        return f"<User {self.email}>"
