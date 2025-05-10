import datetime
import logging
from flask import jsonify, request, session, render_template    
from flask_login import login_user, logout_user, current_user
import bcrypt

from models.users import Users, UserType
from models.employee.employees import Employee
from models.employer.employers import Employer
from models.misc.geographic import Cities, Countries
from database.database import db

def email_exists(email):
    return Users.query.filter_by(email=email).first() is not None

def username_exists(username):
    return Users.query.filter_by(username=username).first() is not None

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_employee(user_id, data):
    try:
        dob = data.get('date_of_birth')
        dob = datetime.datetime.strptime(dob, '%Y-%m-%d').date() if dob else None
        print(data.get('city_id'), data.get('city'), data.get('country_id'), data.get('profession'), data.get('mobile_number'))  # these are the)
        employee = Employee(
            user_id=user_id,
            date_of_birth=dob,
            current_location_id=data.get('city_id'),
            citizenship_id=data.get('citizenship_id'),
            profession=data.get('profession'),
            mobile_number=data.get('mobile_number'),
        )
        db.session.add(employee)
    except Exception as e:
        logging.exception("Failed to create employee record")
        raise

def create_employer(user_id, data):
    try:
        employer = Employer(
            user_id=user_id,
            business_name=data.get('business_name'),
            business_type=data.get('business_type')
        )
        db.session.add(employer)
    except Exception as e:
        logging.exception("Failed to create employer record")
        raise

def set_user_session(user, user_type):
    login_user(user)
    session['user_name'] = user.full_name
    session['user_email'] = user.email
    session['username'] = user.username
    current_user = user
    if user_type == 'employee':
        employee = Employee.query.filter_by(user_id=user.user_id).first()
        if employee:
            print(employee.current_location_id, employee.citizenship_id, employee.profession, employee.mobile_number, employee.date_of_birth)
            city = Cities.query.filter_by(city_id=employee.current_location_id).first()
            country = Countries.query.filter_by(country_id=city.country_id).first()
            citizenship = Countries.query.filter_by(country_id=employee.citizenship_id).first()

            session['profession'] = employee.profession
            session['location'] = city.city + ', ' + country.country_name
            session['number'] = employee.mobile_number
            session['dob'] = employee.date_of_birth
            session['citizenship'] = citizenship.country_name
            session['user_type'] = "employee"
    elif user_type == 'employer':
        employer = Employer.query.filter_by(user_id=user.user_id).first()
        if employer:
            session['business_name'] = employer.business_name
            session['business_type'] = employer.business_type
            session['user_type'] = "employer"

    
# Signup function
def signup(email, password, full_name, username, user_type, extra_data={}):
    valid_user_types = ["employee", "employer", "admin"]
    if user_type not in valid_user_types:
        return jsonify({'error': 'Invalid user type'}), 400

    if email_exists(email):
        return jsonify({'error': 'Email already registered'}), 409

    password_hash = hash_password(password)

    try:
        new_user = Users(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            user_type=user_type,
            username=username
        )
        db.session.add(new_user)
        db.session.commit()

        if user_type == 'employee':
            create_employee(new_user.user_id, extra_data)
        elif user_type == 'employer':
            create_employer(new_user.user_id, extra_data)

        db.session.commit()
        set_user_session(new_user, user_type)

        return jsonify({
            'message': 'Signup successful',
            'user_id': new_user.user_id,
            'user_type': new_user.user_type,
            'full_name': new_user.full_name,
            'username' : new_user.username
        }), 201

    except Exception as e:
        db.session.rollback()
        logging.exception("Signup failed")
        return jsonify({'error': str(e)}), 500

# Login function
def login(email, password):
    try:
        user = Users.query.filter_by(email=email).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            login_user(user)
            session['user_name'] = user.full_name
            session['user_email'] = user.email
            set_user_session(user, user.user_type.name)
            return jsonify({
                'message': 'Login successful',
                'user_id': user.user_id,
                'user_type': user.user_type.name
            }), 200
        else:
            return jsonify({'error': 'Invalid password'}), 401

    except Exception as e:
        logging.exception("Login failed")
        return jsonify({'error': str(e)}), 500

def logout():
    try:
        session.clear()
        logout_user()
        return render_template('index.html')
    except Exception as e:
        logging.exception("Logout failed")
        return jsonify({'error': str(e)}), 500
