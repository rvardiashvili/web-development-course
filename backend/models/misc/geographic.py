from database.database import db
import enum
import datetime
from sqlalchemy import Enum as SQLAlchemyEnum
from flask_login import UserMixin

# Enums
class Countries(db.Model):
    __tablename__ = 'Countries'
    country_id = db.Column(db.Integer, primary_key=True)
    country_name = db.Column(db.String(255), nullable=False)

class Cities(db.Model):
    __tablename__ = 'Cities'

    city_id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(255), nullable=False)
    state = db.Column(db.String(255), nullable=True)
    country_id = db.Column(db.Integer, db.ForeignKey('Countries.countries_id'), nullable=False)

