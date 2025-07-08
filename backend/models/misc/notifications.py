from database.database import db
import enum
from datetime import datetime, timezone
from sqlalchemy import Enum as SQLAlchemyEnum
from flask_login import UserMixin

class Notifications(db.Model):
    __tablename__ = 'Notifications'
    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g., 'like', 'comment', 'follow', 'group_invite'
    source_id = db.Column(db.Integer)  # ID of the related entity (post_id, user_id, group_id, etc.)
    source_type = db.Column(db.String(50)) # e.g., 'post', 'user', 'group'
    content = db.Column(db.String(500), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('Users', backref='notifications')
    