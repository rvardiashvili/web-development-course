# users.py
from database.database import db
from flask_login import UserMixin
from datetime import datetime
import sqlalchemy as sa # Import sqlalchemy
from sqlalchemy.orm import relationship # Import relationship explicitly
from sqlalchemy.types import JSON # Import JSON type


# NO imports of Employee, Employer, Post, GroupMembership, EmployerAccount here

# Helper table for Followers (Many-to-Many) - Can be defined here or in its own file
Followers = db.Table('Followers',
    db.Column('follower_id', db.Integer, sa.ForeignKey('Users.user_id'), primary_key=True),
    db.Column('followed_id', db.Integer, sa.ForeignKey('Users.user_id'), primary_key=True)
)

class UserType(db.Enum):
    employee = 'employee'
    employer = 'employer'
    admin = 'admin'

class Users(db.Model, UserMixin):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True)
    profile_picture = db.Column(db.String(225))
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum('employee', 'employer', 'admin'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_authenticated = db.Column(db.Boolean, default=True)
    is_anonymous = db.Column(db.Boolean, default=False)
    bio = db.Column(db.Text) # Added bio column
    
    user_flags = db.Column(JSON, default={}, nullable=False)


    # Define relationships that start from User, using string names for target models
    # The corresponding backref will be defined in the other model's file



    # One-to-Many with Posts


    # Required by Flask-Login
    def get_id(self):
        return str(self.user_id)