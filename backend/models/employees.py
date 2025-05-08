from database.database import db

class Employees(db.Model):
    __tablename__ = 'Employees'
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), primary_key=True)
    date_of_birth = db.Column(db.Date)
    user = db.relationship('Users', backref='employee')
