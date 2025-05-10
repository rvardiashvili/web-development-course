from flask import Blueprint, request, render_template
from services.auth_services import signup, login, logout, username_exists, email_exists

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup_route():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    user_type = data.get('user_type')
    username = data.get('username')
    extra_data = {
        'date_of_birth': data.get('date_of_birth'),
        'city_id': data.get('city_id'),
        'city': data.get('city'),
        'citizenship_id': data.get('country_id'),
        'citizenship': data.get('country'),
        'country_code': data.get('country_dial_code'), 
        'mobile_number': data.get('mobile_number'),
        'profession': data.get('profession'),
        'business_type': data.get('business_type'),
        'business_name': data.get('business_name'),
    }
    print(extra_data)

    return signup(email, password, full_name, username, user_type, extra_data)

@auth_bp.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()
    email = data.get('username')
    password = data.get('password')
    return login(email, password)

@auth_bp.route('/logout')
def logout_route():
    return logout()

@auth_bp.route('/checkusername', methods=['GET'])
def check_username():
    username = request.args.get('username')
    return {'exists': username_exists(username)}

#check email exists
@auth_bp.route('/checkemail', methods=['GET'])
def check_email():
    email = request.args.get('email')
    return {'exists': email_exists(email)}
