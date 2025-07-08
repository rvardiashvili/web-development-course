from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from services import group_services  # Import your group services module

group_routes_bp = Blueprint('groups', __name__, url_prefix='/api/groups')

@group_routes_bp.route('/create', methods=['POST'])
@login_required
def create_group():
    if 'name' not in request.form or not request.form['name'].strip():
        return jsonify({'status': 'error', 'message': 'Group name is required.'}), 400

    if 'description' not in request.form or not request.form['description'].strip():
        return jsonify({'status': 'error', 'message': 'Description is required.'}), 400

    name = request.form['name'].strip()
    description = request.form['description'].strip()
    profile_picture = request.files.get('profile_picture')

    result = group_services.create_group(name, description, profile_picture, current_user.user_id)

    if result['status'] == 'success':
        return jsonify(result), 201
    else:
        return jsonify(result), result.get('status_code', 400)


@group_routes_bp.route('/<int:group_id>', methods=['GET'])
def get_group(group_id):
    group_data = group_services.get_group(group_id)
    if group_data:
        # group_data is now a dictionary, which is JSON serializable
        return jsonify(group_data), 200
    else:
        return jsonify({'status': 'error', 'message': 'Group not found'}), 404

@group_routes_bp.route('/<int:group_id>/update', methods=['PUT'])
@login_required
def update_group(group_id):    # Check if the group exists
    group_data = group_services.get_group(group_id)
    if not group_data:
        return jsonify({'status': 'error', 'message': 'Group not found.'}), 404

    # Check if the current user is an admin of the group
    if not group_data.get('is_admin'):
        return jsonify({'status': 'error', 'message': 'Permission denied. Only group admins can update group information.'}), 403

    name = request.form.get('name')
    description = request.form.get('description')
    profile_picture = request.files.get('profile_picture')
    cover_picture = request.files.get('cover_picture')

    result = group_services.update_group(
        group_id,
        current_user.user_id,
        name=name,
        description=description,
        profile_picture=profile_picture,
        cover_picture=cover_picture
    )

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 400)

    pass # Placeholder, implement update logic

@group_routes_bp.route('/<int:group_id>', methods=['DELETE'])
@login_required
def delete_group(group_id):
    user_id = current_user.user_id
    result = group_services.delete_group(group_id, user_id)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 400)


@group_routes_bp.route('/all', methods=['GET'])
def get_all_groups():
    groups = group_services.get_all_groups()
    return jsonify(groups), 200

@group_routes_bp.route('/user_groups', methods=['GET'])
@login_required
def get_user_groups():
    user_id = current_user.user_id
    groups = group_services.get_user_groups(user_id)
    return jsonify(groups), 200

@group_routes_bp.route('/<int:group_id>/join', methods=['POST'])
@login_required
def join_group(group_id):
    user_id = current_user.user_id
    result = group_services.join_group(group_id, user_id)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 400)

@group_routes_bp.route('/<int:group_id>/members', methods=['GET'])
@login_required
def get_group_members(group_id):
    members = group_services.get_group_members(group_id)
    if members:
        return jsonify(members), 200
    else:
        return jsonify({'status': 'error', 'message': 'Group not found or no members.'}), 404

@group_routes_bp.route('/<int:group_id>/leave', methods=['POST'])
@login_required
def leave_group(group_id):
    user_id = current_user.user_id
    result = group_services.leave_group(group_id, user_id)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 400)

@group_routes_bp.route('/<int:group_id>/transfer-admin', methods=['POST'])
@login_required
def transfer_group_admin(group_id):
    new_admin_user_id = request.json.get('new_admin_user_id')
    if not new_admin_user_id:
        return jsonify({'status': 'error', 'message': 'New admin user ID is required.'}), 400

    result = group_services.transfer_group_admin(group_id, current_user.user_id, new_admin_user_id)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 400)

@group_routes_bp.route('/<int:group_id>/members/<int:member_user_id>/role', methods=['PUT'])
@login_required
def update_group_member_role(group_id, member_user_id):
    new_role = request.json.get('role')
    if not new_role or new_role not in ['member', 'moderator']: # Assuming only these two roles can be set via this endpoint
        return jsonify({'status': 'error', 'message': 'Invalid role specified.'}), 400

    result = group_services.update_group_member_role(group_id, member_user_id, new_role, current_user.user_id)
    return jsonify(result), result.get('status_code', 400)


@group_routes_bp.route('/<int:group_id>/members/<int:user_id>', methods=['DELETE'])
@login_required
def remove_group_member(group_id, user_id):
    # Assuming current_user is an admin of the group
    # You'll need to add logic in group_services to check admin permissions
    result = group_services.remove_group_member(group_id, user_id, current_user.user_id)
    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), result.get('status_code', 400)
