from flask import Blueprint, request, render_template

auth_page_bp = Blueprint('auth_page', __name__, url_prefix='/auth')

@auth_page_bp.route('/signup', methods=['GET'])
def handle_signup():
    return render_template('signup.html')

@auth_page_bp.route('/login', methods=['GET'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == 'admin' and password == 'password':
            session['username'] = username
            return redirect(url_for('feed'))
        else:
            return 'Invalid credentials', 401
    return render_template('login.html')
