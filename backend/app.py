from flask import Flask, render_template, request, redirect, url_for, session
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from models.users import Users
from database.database import db
import os


app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
app.secret_key = 'your_secret_key'
#db_pass = os.environ['DATABASE_PASS']
db_pass = "pass"
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://app:{db_pass}@localhost/kai'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = '/auth/login'

@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(int(user_id))



from routes import init_app

db.init_app(app)

init_app(app)


# Table creation
with app.app_context():
    db.create_all()