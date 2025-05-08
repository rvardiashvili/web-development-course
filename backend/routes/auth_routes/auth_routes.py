from flask import Blueprint, request, render_template
from services.auth_services import signup, login, logout

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup_route():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    user_type = data.get('user_type')
    extra_data = {
        'date_of_birth': data.get('date_of_birth'),
        'business_name': data.get('business_name'),
        'business_type': data.get('business_type')
    }


    return signup(email, password, full_name, user_type, extra_data)

@auth_bp.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()
    email = data.get('username')
    password = data.get('password')
    return login(email, password)

@auth_bp.route('/logout')
def logout_route():
    return logout()