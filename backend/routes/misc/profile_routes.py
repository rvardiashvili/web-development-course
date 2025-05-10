from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user # Assuming Flask-Login
from services import profile_services # Import your service functions

profile_api_bp = Blueprint('profile_api', __name__, url_prefix='/api/profile')

@profile_api_bp.route('/upload_profile_pic', methods=['POST'])
@login_required
def upload_profile_pic_route():
    if 'profile_pic' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400

    file = request.files['profile_pic']
    result = profile_services.upload_profile_picture(current_user, file)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 400 # Use 400 for client errors, 500 for server errors


@profile_api_bp.route('/delete_profile_pic', methods=['POST'])
@login_required
def delete_profile_pic_route():
    result = profile_services.delete_profile_picture(current_user)

    if result['status'] == 'success' or result['status'] == 'info':
        return jsonify(result), 200
    else:
        return jsonify(result), 500


@profile_api_bp.route('/update_bio', methods=['POST'])
@login_required
def update_bio_route():
    data = request.form # Assuming bio is sent as form data
    bio_text = data.get('bio', '')

    result = profile_services.update_user_bio(current_user, bio_text)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 500


# --- Routes for Work Experience ---

@profile_api_bp.route('/work-experience', methods=['POST']) # Use POST for adding
@login_required
def add_work_experience_route():
    # Ensure the user is an employee before allowing work experience updates
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Work experience is only for employees.'}), 403

    data = request.form
    # Basic validation (can be expanded in service or here)
    if not data.get('title') or not data.get('company') or not data.get('start_date'):
         return jsonify({'status': 'error', 'message': 'Missing required fields (Title, Company, Start Date).'}), 400

    result = profile_services.add_work_experience(current_user.user_id, data)

    if result['status'] == 'success':
        return jsonify(result), 201 # 201 Created
    else:
        return jsonify(result), 500


@profile_api_bp.route('/work-experience/<int:experience_id>', methods=['PUT', 'DELETE']) # Use PUT for updating, DELETE for deleting
@login_required
def manage_work_experience_route(experience_id):
     # Ensure the user is an employee
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Work experience is only for employees.'}), 403

    if request.method == 'PUT':
        data = request.form
        # Basic validation
        if not data.get('title') or not data.get('company') or not data.get('start_date'):
            return jsonify({'status': 'error', 'message': 'Missing required fields (Title, Company, Start Date).'}), 400

        result = profile_services.update_work_experience(experience_id, current_user.user_id, data)

        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            status_code = 404 if 'not found' in result.get('message', '').lower() else 500
            return jsonify(result), status_code

    elif request.method == 'DELETE':
        result = profile_services.delete_work_experience(experience_id, current_user.user_id)

        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            status_code = 404 if 'not found' in result.get('message', '').lower() else 500
            return jsonify(result), status_code


# --- Routes for Projects ---

@profile_api_bp.route('/projects', methods=['POST']) # Use POST for adding
@login_required
def add_project_route():
     # Ensure the user is an employee
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Projects are only for employees.'}), 403

    data = request.form
     # Basic validation
    if not data.get('title'):
         return jsonify({'status': 'error', 'message': 'Missing required field (Title).'}), 400

    result = profile_services.add_project(current_user.user_id, data)

    if result['status'] == 'success':
        return jsonify(result), 201
    else:
        return jsonify(result), 500


@profile_api_bp.route('/projects/<int:project_id>', methods=['PUT', 'DELETE'])
@login_required
def manage_project_route(project_id):
     # Ensure the user is an employee
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Projects are only for employees.'}), 403

    if request.method == 'PUT':
        data = request.form
         # Basic validation
        if not data.get('title'):
            return jsonify({'status': 'error', 'message': 'Missing required field (Title).'}), 400

        result = profile_services.update_project(project_id, current_user.user_id, data)

        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            status_code = 404 if 'not found' in result.get('message', '').lower() else 500
            return jsonify(result), status_code

    elif request.method == 'DELETE':
        result = profile_services.delete_project(project_id, current_user.user_id)

        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            status_code = 404 if 'not found' in result.get('message', '').lower() else 500
            return jsonify(result), status_code

# --- Routes for Education ---

@profile_api_bp.route('/education', methods=['POST']) # Use POST for adding
@login_required
def add_education_route():
     # Ensure the user is an employee
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Education is only for employees.'}), 403

    data = request.form
     # Basic validation
    if not data.get('degree') or not data.get('institution'):
         return jsonify({'status': 'error', 'message': 'Missing required fields (Degree, Institution).'}), 400

    result = profile_services.add_education(current_user.user_id, data)

    if result['status'] == 'success':
        return jsonify(result), 201
    else:
        return jsonify(result), 500

@profile_api_bp.route('/languages', methods=['POST'])
@login_required # Ensure the user is logged in
def update_languages_route():
    # Assuming languages are sent in the form data or JSON
    languages_text = request.form.get('languages') or request.json.get('languages')

    if not languages_text:
        return jsonify({'status': 'error', 'message': 'Languages text is required.'}), 400

    result = profile_services.update_employee_languages(current_user.user_id, languages_text)

    if result.get('status') == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 400 # Or 500 depending on the error

@profile_api_bp.route('/education/<int:education_id>', methods=['PUT', 'DELETE'])
@login_required
def manage_education_route(education_id):
     # Ensure the user is an employee
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Education is only for employees.'}), 403

    if request.method == 'PUT':
        data = request.form
         # Basic validation
        if not data.get('degree') or not data.get('institution'):
            return jsonify({'status': 'error', 'message': 'Missing required fields (Degree, Institution).'}), 400

        result = profile_services.update_education(education_id, current_user.user_id, data)

        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            status_code = 404 if 'not found' in result.get('message', '').lower() else 500
            return jsonify(result), status_code

    elif request.method == 'DELETE':
        result = profile_services.delete_education(education_id, current_user.user_id)

        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            status_code = 404 if 'not found' in result.get('message', '').lower() else 500
            return jsonify(result), status_code


# --- Routes for Skills and Interests ---

@profile_api_bp.route('/skills', methods=['POST'])
@login_required
def update_skills_route():
     # Ensure the user is an employee
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Skills are only for employees.'}), 403

    data = request.form
    skills_text = data.get('skills', '')

    result = profile_services.update_employee_skills(current_user.user_id, skills_text)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 500


@profile_api_bp.route('/interests', methods=['POST'])
@login_required
def update_interests_route():
     # Ensure the user is an employee
    if current_user.user_type != 'employee':
         return jsonify({'status': 'error', 'message': 'Interests are only for employees.'}), 403

    data = request.form
    interests_text = data.get('interests', '')

    result = profile_services.update_employee_interests(current_user.user_id, interests_text)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@profile_api_bp.route('/<int:user_id>', methods=['GET'])
@login_required # Or adjust based on whether profiles are public
def get_user_profile_route(user_id):
    profile_data = profile_services.get_user_profile_data(user_id)

    if profile_data and profile_data.get('status') == 'success':
        return jsonify(profile_data), 200
    else:
        # Return error status and message if user not found or service failed
        status_code = 404 if profile_data and 'not found' in profile_data.get('message', '').lower() else 500
        return jsonify(profile_data or {'status': 'error', 'message': 'Failed to fetch profile data.'}), status_code

@profile_api_bp.route('/follow/<int:current_user_id>/<int:target_user_id>', methods=['GET'])
@login_required
def follow_user_route(current_user_id, target_user_id):
    if current_user_id != target_user_id:
        result = profile_services.follow_user(current_user_id, target_user_id)

        if result['status'] == 'success':
            return jsonify(result), 200
        else:
            status_code = 404 if 'not found' in result.get('message', '').lower() else 500
            return jsonify(result), status_code

    return jsonify({'status': 'error', 'message': 'Cannot follow yourself.'}), 400

@profile_api_bp.route('/follows/<int:user_id>', methods=['GET'])
def get_follows_route(user_id):
    follows_data = profile_services.get_follows(user_id)

    if follows_data and follows_data.get('status') =='success':
        return jsonify(follows_data), 200
    else:
        # Return error status and message if user not found or service failed
        status_code = 404 if follows_data and 'not found' in follows_data.get('message', '').lower() else 500
        return jsonify(follows_data or {'status': 'error', 'message': 'Failed to fetch follow data.'}), status_code


