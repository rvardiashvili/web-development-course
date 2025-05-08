from database.database import db

class Employees(db.Model):
    __tablename__ = 'Employees'
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), primary_key=True)
    date_of_birth = db.Column(db.Date)
    user = db.relationship('Users', backref='employee')
    current_location_id = db.Column(db.Integer, db.ForeignKey('Cities.city_id'))
    citizenship_id = db.Column(db.Integer, db.ForeignKey('Countries.country_id'))
    profession = db.Column(db.String(255))
    mobile_number = db.Column(db.String(20))
