from database.database import db

from models.users import Users # Assuming users.py is in the parent directory of employee
from models.misc.geographic import Countries, Cities # Assuming geographic.py is in misc

# Import models for relationships where Employee is the "one" side
from models.employee.work_experience import WorkExperience
from models.employee.education import Education
from models.employee.project import Project

class Employee(db.Model):
    __tablename__ = 'Employees'
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), primary_key=True)
    date_of_birth = db.Column(db.Date)
    mobile_number = db.Column(db.String(20))
    profession = db.Column(db.String(255))
    citizenship_id = db.Column(db.Integer, db.ForeignKey('Countries.country_id'))
    current_location_id = db.Column(db.Integer, db.ForeignKey('Cities.city_id'))

    # New relationships for the added fields
    work_experiences = db.relationship('WorkExperience', backref='employee', lazy='dynamic')
    projects = db.relationship('Project', backref='employee', lazy='dynamic')
    education = db.relationship('Education', backref='employee', lazy='dynamic')

    # New columns for skills and interests
    skills = db.Column(db.Text)
    interests = db.Column(db.Text)
    languages = db.Column(db.Text)