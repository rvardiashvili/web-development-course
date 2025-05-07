from flask import Blueprint, request, render_template
from services.auth_services import signup  

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup_route():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    user_type = data.get('user_type')
    extra_data = data.get('extra_data', {})

    return signup(email, password, full_name, user_type, extra_data)
