import datetime
from flask import jsonify
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


