from flask import Flask, render_template, request, redirect, url_for, session
from database.database import db
import os
app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
app.secret_key = 'your_secret_key'
db_pass = os.environ['DATABASE_PASS']
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://app:{db_pass}@localhost/kai'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

import user



@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
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

@app.route('/signup', methods=['POST', 'GET'])
def handle_signup():
    if request.method == 'POST':
        form = request.form
        email = form.get('email')
        password = form.get('password')
        full_name = form.get('full_name')
        user_type = form.get('user_type')
        repeat_password = form.get('repeat_password')

        if password != repeat_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        extra_data = {}
        if user_type == 'employee':
            extra_data['date_of_birth'] = form.get('date_of_birth')
        elif user_type == 'employer':
            extra_data['business_name'] = form.get('business_name')
            extra_data['business_type'] = form.get('business_type')

        return user.signup(email, password, full_name, user_type, extra_data)

    return render_template('signup.html')

@app.route('/feed')
def feed():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('feed.html')

@app.route('/profile')
def profile():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('profile.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

# Table creation
with app.app_context():
    db.create_all()