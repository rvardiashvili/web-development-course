from flask import Blueprint, request, render_template
from services import notifications_services
from flask_login import current_user, login_required

notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

@notifications_bp.route('/', methods=['GET'])
@login_required
def get_notifications():
    user_id = current_user.user_id
    read_filter = request.args.get('read')
    notifications = notifications_services.get_notifications(user_id, read=read_filter)
    return notifications

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(notification_id):
    user_id = current_user.user_id
    return notifications_services.delete_notification(notification_id, user_id)

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@login_required
def mark_notification_as_read(notification_id):
    user_id = current_user.user_id
    return notifications_services.mark_notification_as_read(notification_id, user_id)
