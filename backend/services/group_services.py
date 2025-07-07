from werkzeug.utils import secure_filename
import os
from datetime import datetime
from models.social.posts import Posts
from flask_login import current_user  
from database.database import db
from models.social.groups import Group, GroupMembership
from config import UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = os.path.join(UPLOAD_FOLDER, 'communities/pfp')
DEFAULT_COMMUNITY_PICTURE = '/static/media/default/community.png'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def create_group(name, description, profile_picture, creator_id):
    if Group.query.filter_by(name=name).first():
        return {'status': 'error', 'message': 'A group with this name already exists.', 'status_code': 409}

    new_group = Group(
        name=name,
        description=description,
        profile_picture=DEFAULT_COMMUNITY_PICTURE,
        creator_id=creator_id
    )

    if profile_picture and allowed_file(profile_picture.filename):
        filename = secure_filename(profile_picture.filename)
        unique_filename = f"{creator_id}_{int(datetime.utcnow().timestamp())}_{filename}"

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        profile_picture.save(file_path)

        new_group.profile_picture = f'/static/uploads/communities/pfp/{unique_filename}'

    try:
        db.session.add(new_group)
        db.session.flush()  # Flush to get the group_id before committing

        admin_membership = GroupMembership(
            user_id=creator_id,
            group_id=new_group.group_id,
            role='admin'
        )
        db.session.add(admin_membership)
        db.session.commit()

        return {'status': 'success', 'message': 'Group created successfully!', 'group_id': new_group.group_id}

    except Exception as e:
        db.session.rollback()
        print(f"Error creating group: {e}")
        return {'status': 'error', 'message': 'An internal error occurred. Please try again.', 'status_code': 500}

def get_group(group_id):
    """
    Retrieves a group by its ID and returns its data as a dictionary.
    """
    group = Group.query.get(group_id)
    if group:
        # Convert the SQLAlchemy Group object to a dictionary for JSON serialization
        is_member = False
        is_admin = False
        membership = GroupMembership.query.filter_by(group_id=group.group_id, user_id=current_user.user_id).first()
        if membership:
            is_member = True
            if membership.role == 'admin':
                is_admin = True
        print(is_member, is_admin)
        return {
            'group_id': group.group_id,
            'name': group.name,
            'description': group.description,
            'profile_picture': group.profile_picture,
            'creator_id': group.creator_id,
            # Add other fields you want to expose, e.g., members_count, events_count, pins_count
            # For now, these are placeholders as they are not directly in the Group model
            'members_count': 0, # Placeholder
            'events_count': 0, # Placeholder
            'pins_count': 0, # Placeholder
            'is_member': is_member, # Placeholder, needs to be set based on current user
            'is_admin': is_admin, # Placeholder, needs to be set based on current useri
            'members_count': db.session.query(GroupMembership).filter_by(group_id=group.group_id).count(),
            'created_at': group.created_at.isoformat() if group.created_at else None,
        }
    return None


def get_all_groups():
    groups = Group.query.all()
    return [{'group_id': g.group_id, 'name': g.name} for g in groups]


# Implement update_group and delete_group services similarly
# ...
def get_user_groups(user_id):
    memberships = GroupMembership.query.filter_by(user_id=user_id).all()
    group_ids = [m.group_id for m in memberships]
    groups = Group.query.filter(Group.group_id.in_(group_ids)).all()
    return [{'group_id': g.group_id, 'name': g.name, 'profile_picture': g.profile_picture} for g in groups]

def join_group(group_id, user_id):
    group = Group.query.get(group_id)
    if not group:
        return {'status': 'error', 'message': 'Group not found.', 'status_code': 404}

    existing_membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
    if existing_membership:
        return {'status': 'info', 'message': 'User is already a member of this group.', 'status_code': 200}

    try:
        new_membership = GroupMembership(group_id=group_id, user_id=user_id, role='member')
        db.session.add(new_membership)
        db.session.commit()
        return {'status': 'success', 'message': 'Successfully joined the group.', 'status_code': 200}
    except Exception as e:
        db.session.rollback()
        print(f"Error joining group: {e}")
        return {'status': 'error', 'message': 'An internal error occurred while joining the group.', 'status_code': 500}

def get_group_members(group_id):
    """
    Retrieves all members of a specific group.
    """
    group = Group.query.get(group_id)
    if not group:
        return None  # Or raise an error, or return an empty list with an error status

    memberships = GroupMembership.query.filter_by(group_id=group_id).all()
    members_data = []
    for membership in memberships:
        user = membership.user  # Assuming a relationship to the User model exists
        if user:
            members_data.append({
                'user_id': user.user_id,
                'username': user.username,
                'full_name': user.full_name,
                'profile_picture': user.profile_picture,
                'role': membership.role
            })
    return members_data

def leave_group(group_id, user_id):
    group = Group.query.get(group_id)
    if not group:
        return {'status': 'error', 'message': 'Group not found.', 'status_code': 404}

    membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not membership:
        return {'status': 'info', 'message': 'User is not a member of this group.', 'status_code': 200}

    # Prevent creator from leaving their own group unless they delete it
    if group.creator_id == user_id:
        return {'status': 'error', 'message': 'Group creator cannot leave their own group. Consider deleting the group instead.', 'status_code': 403}

    try:
        db.session.delete(membership)
        db.session.commit()
        return {'status': 'success', 'message': 'Successfully left the group.', 'status_code': 200}
    except Exception as e:
        db.session.rollback()
        print(f"Error leaving group: {e}")
        return {'status': 'error', 'message': 'An internal error occurred while leaving the group.', 'status_code': 500}

def remove_group_member(group_id, user_id_to_remove, admin_user_id):
    group = Group.query.get(group_id)
    if not group:
        return {'status': 'error', 'message': 'Group not found.', 'status_code': 404}

    # Check if the admin_user_id is actually an admin of this group
    requester_membership = GroupMembership.query.filter_by(group_id=group_id, user_id=admin_user_id).first()
    if not requester_membership or requester_membership.role not in ['admin', 'moderator']:
        return {'status': 'error', 'message': 'Permission denied. Only group admins or moderators can remove members.', 'status_code': 403}

    # Prevent an admin from removing themselves or the creator
    member_to_remove_role = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id_to_remove).first()
    if member_to_remove_role and member_to_remove_role.role == 'moderator' and requester_membership.role == 'moderator':
        return {'status': 'error', 'message': 'Moderators cannot remove other moderators.', 'status_code': 403}

    if user_id_to_remove == admin_user_id:
        return {'status': 'error', 'message': 'Admins cannot remove themselves.', 'status_code': 403}
    
    membership_to_remove = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id_to_remove).first()
    if not membership_to_remove:
        return {'status': 'info', 'message': 'User is not a member of this group.', 'status_code': 200}

    try:
        print("trying to remove member: ")
        db.session.delete(membership_to_remove)
        db.session.commit()
        return {'status': 'success', 'message': 'Member removed successfully.', 'status_code': 200}
    except Exception as e:
        db.session.rollback()
        print(f"Error removing group member: {e}")
        return {'status': 'error', 'message': 'An internal error occurred while removing the member.', 'status_code': 500}
    

def update_group_member_role(group_id, member_user_id, new_role, admin_user_id):
    group = Group.query.get(group_id)
    if not group:
        return {'status': 'error', 'message': 'Group not found.', 'status_code': 404}

    # Check if the admin_user_id is actually an admin of this group
    admin_membership = GroupMembership.query.filter_by(group_id=group_id, user_id=admin_user_id).first()
    if not admin_membership or admin_membership.role != 'admin':
        return {'status': 'error', 'message': 'Permission denied. Only group admins can change member roles.', 'status_code': 403}

    # Prevent changing the role of the group creator (who should always be an admin)
    if member_user_id == group.creator_id and new_role != 'admin':
        return {'status': 'error', 'message': 'Cannot demote the group creator.', 'status_code': 403}

    membership_to_update = GroupMembership.query.filter_by(group_id=group_id, user_id=member_user_id).first()
    if not membership_to_update:
        return {'status': 'error', 'message': 'Member not found in this group.', 'status_code': 404}

    try:
        membership_to_update.role = new_role
        db.session.commit()
        return {'status': 'success', 'message': f'Member role updated to {new_role} successfully.', 'status_code': 200}
    except Exception as e:
        db.session.rollback()
        print(f"Error updating group member role: {e}")
        return {'status': 'error', 'message': 'An internal error occurred while updating the member role.', 'status_code': 500}

def transfer_group_admin(group_id, current_admin_user_id, new_admin_user_id):
    group = Group.query.get(group_id)
    if not group:
        return {'status': 'error', 'message': 'Group not found.', 'status_code': 404}

    # Check if the current_admin_user_id is the actual admin of this group
    current_admin_membership = GroupMembership.query.filter_by(group_id=group_id, user_id=current_admin_user_id).first()
    if not current_admin_membership or current_admin_membership.role != 'admin':
        return {'status': 'error', 'message': 'Permission denied. Only the current group admin can transfer admin rights.', 'status_code': 403}

    # Check if the new admin user is a member of the group
    new_admin_membership = GroupMembership.query.filter_by(group_id=group_id, user_id=new_admin_user_id).first()
    if not new_admin_membership:
        return {'status': 'error', 'message': 'New admin user is not a member of this group.', 'status_code': 400}

    # Prevent transferring admin to self (though technically harmless, it's redundant)
    if current_admin_user_id == new_admin_user_id:
        return {'status': 'info', 'message': 'Cannot transfer admin to yourself.', 'status_code': 200}

    try:
        # Demote current admin to member (or moderator, depending on policy)
        current_admin_membership.role = 'member' # Or 'moderator'
        
        # Promote new admin
        new_admin_membership.role = 'admin'

        # Update the group's creator_id if the original creator is transferring admin away
        # This is important if creator_id is used to determine the ultimate owner/admin
        group.creator_id = new_admin_user_id

        db.session.commit()
        return {'status': 'success', 'message': 'Group admin transferred successfully.', 'status_code': 200}
    except Exception as e:
        db.session.rollback()
        print(f"Error transferring group admin: {e}")
        return {'status': 'error', 'message': 'An internal error occurred while transferring the admin.', 'status_code': 500}

def delete_group(group_id, user_id):
    group = Group.query.get(group_id)
    if not group:
        return {'status': 'error', 'message': 'Group not found.', 'status_code': 404}

    # Check if the user is an admin of the group
    user_membership = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not user_membership or user_membership.role != 'admin':
        return {'status': 'error', 'message': 'Permission denied. Only group admins can delete the group.', 'status_code': 403}

    try:
        # Delete all associated memberships first
        # Delete all posts associated with the group
        Posts.query.filter_by(group_id=group_id).delete()

        GroupMembership.query.filter_by(group_id=group_id).delete()
        
        # Delete the group itself
        db.session.delete(group)
        db.session.commit()
        return {'status': 'success', 'message': 'Group deleted successfully.', 'status_code': 200}
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting group: {e}")
        return {'status': 'error', 'message': 'An internal error occurred while deleting the group.', 'status_code': 500}
        