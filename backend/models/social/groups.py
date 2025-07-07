# social/groups.py
from database.database import db
from datetime import datetime

# Import models referenced by FKs or for relationships
from models.users import Users # Assuming users.py is in the parent directory of social

# Helper table for GroupMemberships (Many-to-Many implied by your SQL, but a separate model is more flexible)
# If you have a GroupMembership model, import it here


class Group(db.Model):
    __tablename__ = 'Groups'
    group_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    profile_picture = db.Column(db.String(255), default='/static/media/communities/pfp/default.jpg')
    cover_picture = db.Column(db.String(255), default='/static/media/communities/cover/default.jpg')
    creator_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)

    # Relationships (assuming a GroupMembership model exists)
    memberships = db.relationship('GroupMembership', backref='group', lazy='dynamic')


# Assuming you have a GroupMembership model as suggested by your SQL
class GroupMembership(db.Model):
    __tablename__ = 'GroupMemberships'
    group_id = db.Column(db.Integer, db.ForeignKey('Groups.group_id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), primary_key=True)
    role = db.Column(db.Enum('member', 'moderator', 'admin'), default='member')

    # Relationships
    user = db.relationship('Users', backref='group_memberships')
    # group = db.relationship('Group', backref='memberships') # backref defined in Group