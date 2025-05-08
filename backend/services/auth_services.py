import datetime
from flask import jsonify, request, session, render_template    
from flask_login import login_user, logout_user, current_user
import bcrypt

from models.users import Users, UserType
from models.employees import Employees
from models.employers import Employers
from database.database import db

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

        # Handle employee or employer-specific fields
        if user_type == 'employee':
            dob = extra_data.get('date_of_birth')
            if dob:
                dob = datetime.datetime.strptime(dob, '%Y-%m-%d').date()
            employee = Employees(user_id=new_user.user_id, date_of_birth=dob)
            db.session.add(employee)

        elif user_type == 'employer':
            business_name = extra_data.get('business_name')
            print("business_name: ", business_name)
            business_type = extra_data.get('business_type')
            employer = Employers(user_id=new_user.user_id, business_name=business_name, business_type=business_type)
            db.session.add(employer)

        db.session.commit()
        # Optionally auto-login the user after successful signup
        login_user(new_user)
        session['user_name'] = user.full_name
        session['user_email'] = user.email

        return jsonify({'message': 'Signup successful', 'user_id': new_user.user_id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Login function
def login(email, password):
    try:
        print("email: ", email)
        # Check if the user exists
        user = Users.query.filter_by(email=email).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Compare the provided password with the hashed password in the database
        if bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            # If the passwords match, log in the user with Flask-Login's login_user
            login_user(user)
            session['user_name'] = user.full_name
            session['user_email'] = user.email
            return jsonify({'message': 'Login successful', 'user_id': user.user_id, 'user_type': user.user_type.name}), 200
        else:
            # Password does not match
            return jsonify({'error': 'Invalid password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def logout():
    try:
        logout_user()  # Flask-Login logout_user to clear session
        return render_template('index.html')  # Redirect to home page after logout
    except Exception as e:
        return jsonify({'error': str(e)}), 500