from database.database import db

class Employers(db.Model):
    __tablename__ = 'Employers'
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), primary_key=True)
    business_name = db.Column(db.String(255), nullable=False)
    business_type = db.Column(db.String(255))
