from database.database import db
from datetime import datetime, timezone

from models.users import Users # Assuming users.py is in the parent directory of social
from .groups import Group # Assuming groups.py is in the same directory

class Posts(db.Model):
    __tablename__ = 'Posts'
    post_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('Groups.group_id', ondelete='CASCADE'))
    content = db.Column(db.String(1000), nullable=False)
    visibility = db.Column(db.String(255), nullable=False)
    media_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class liked_by(db.Model):
    __tablename__ = 'liked_by'
    post_id = db.Column(db.Integer, db.ForeignKey('Posts.post_id', ondelete='CASCADE'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'),  primary_key=True)
    liked_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    emote_type = db.Column(db.String(255), nullable=False)