from database.database import db
import datetime
import enum
from sqlalchemy import Enum as SQLAlchemyEnum  # Import SQLAlchemy's Enum


from models.employer.employers import Employer # Assuming employer.py is in the same directory
from models.misc.geographic import Cities # Assuming geographic.py is in misc


class JobType(enum.Enum):
    full_time = "full-time"
    part_time = "part-time"
    internship = "internship"
    contract = "contract"

class JobPostings(db.Model):
    __tablename__ = 'JobPostings'
    job_id = db.Column(db.Integer, primary_key=True)
    employer_id = db.Column(db.Integer, db.ForeignKey('Employers.user_id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(1000), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('Cities.city_id'))
    job_level = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), nullable=False)
    job_type = db.Column(SQLAlchemyEnum(JobType), nullable=False)  # Use SQLAlchemyEnum
    posted_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)


    # Relationship to City (optional)
    location = db.relationship('Cities', backref=db.backref('job_postings', lazy=True))