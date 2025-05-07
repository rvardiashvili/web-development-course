from flask import request, jsonify
from database.database import db
import bcrypt
import enum
import datetime
from flask import current_app as app
from sqlalchemy import Enum as SQLAlchemyEnum

# Enums
class UserType(enum.Enum):
    employee = "employee"
    employer = "employer"
    admin = "admin"

# Models
class Users(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    user_type = db.Column(SQLAlchemyEnum(UserType), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Employees(db.Model):
    __tablename__ = 'Employees'
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), primary_key=True)
    date_of_birth = db.Column(db.Date)

class Employers(db.Model):
    __tablename__ = 'Employers'
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), primary_key=True)
    business_name = db.Column(db.String(255), nullable=False)
    business_type = db.Column(db.String(255))

# Signup function
def signup(email, password, full_name, user_type, extra_data={}):
    if user_type not in UserType._value2member_map_:
        return jsonify({'error': 'Invalid user type'}), 400

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        new_user = Users(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            user_type=UserType(user_type)
        )
        db.session.add(new_user)
        db.session.commit()

        if user_type == 'employee':
            dob = extra_data.get('date_of_birth')
            if dob:
                dob = datetime.datetime.strptime(dob, '%Y-%m-%d').date()
            employee = Employees(user_id=new_user.user_id, date_of_birth=dob)
            db.session.add(employee)

        elif user_type == 'employer':
            business_name = extra_data.get('business_name')
            business_type = extra_data.get('business_type')
            employer = Employers(user_id=new_user.user_id, business_name=business_name, business_type=business_type)
            db.session.add(employer)

        db.session.commit()
        return jsonify({'message': 'Signup successful', 'user_id': new_user.user_id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500