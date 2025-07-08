from flask import Blueprint, render_template, abort, redirect, url_for
from flask_login import login_required, current_user
from models.users import Users
from models.employee.employees import Employee
from models.employer.employers import Employer
from models.misc.geographic import Cities, Countries

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/')
@login_required
def my_profile():
    """Shows the logged-in user's own profile."""
    return redirect(url_for('profile.profile', username=current_user.username))


@profile_bp.route('/<username>')
@login_required
def profile(username):
    user = Users.query.filter_by(username=username).first()
    if user is None:
        abort(404)  # Handle the case where the user doesn't exist
    employee = Employee.query.filter_by(user_id=user.user_id).first()
    if employee is None:
      abort(404)  # Handle the case where the user doesn't exist
    city = Cities.query.filter_by(city_id=employee.current_location_id).first()
    if city is None:
        abort(404)  # Handle the case where the user doesn't exist

    if username == current_user.username:
        return render_template('profile.html', viewed_user=user, additional_data=employee, city=city.city, is_self=True)
    else:
        return render_template('profile.html', viewed_user=user, additional_data=employee, city=city.city, is_self=False)

@profile_bp.route('/id/<user_id>')
@login_required
def profile_id(user_id):
    user = Users.query.filter_by(user_id=user_id).first()
    if user is None:
        abort(404)  # Handle the case where the user doesn't exist
    return redirect(url_for('profile.profile', username=user.username))
        