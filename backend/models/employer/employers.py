from database.database import db


from models.users import Users # Assuming users.py is in the parent directory of employer
from models.misc.geographic import Cities


class Employer(db.Model):
    __tablename__ = 'Employers'
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), primary_key=True)
    business_name = db.Column(db.String(255), nullable=False)
    business_type = db.Column(db.String(255))
    locations = db.relationship('EmployerLocations', backref='employer', lazy='dynamic')
    user = db.relationship('Users', backref='employer')


class EmployerLocations(db.Model):
    __tablename__ = 'EmployerLocations'
    city_id = db.Column(db.Integer, db.ForeignKey('Cities.city_id'), primary_key=True)
    employer_id = db.Column(db.Integer, db.ForeignKey('Employers.user_id'), primary_key=True)
    address = db.Column(db.String(255), nullable=False)

    # Relationships
    city = db.relationship('Cities') 