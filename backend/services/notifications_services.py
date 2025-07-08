#get notifications, mark notifications as read, delete notification
from database.database import db  
from datetime import datetime, timezone
from models.misc.notifications import Notifications
from flask import jsonify, request


#notification services
def get_notifications(user_id, read=None, limit=10):
    try:
        query = Notifications.query.filter_by(user_id=user_id)
        if read is not None:
            query = query.filter_by(is_read=read)
        
        notifications = query.order_by(Notifications.created_at.desc()).limit(limit).all()

        if not notifications:
            return jsonify({"message": "No notifications found for this user or matching the criteria"}), 404
        
        serialized_notifications = []
        for notification in notifications:
            serialized_notifications.append({
                'notification_id': notification.notification_id,
                'user_id': notification.user_id,
                'type': notification.type,
                'source_id': notification.source_id,
                'source_type': notification.source_type,
                'content': notification.content,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat() if notification.created_at else None,            })
        return jsonify(serialized_notifications), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error retrieving notifications: {str(e)}"}), 500

def mark_notification_as_read(notification_id, user_id):
    try:
        notification = Notifications.query.get(notification_id)
        if not notification:
            return jsonify({"message": "Notification not found"}), 404
    
        if notification.user_id != user_id:
            return jsonify({"message": "Unauthorized to mark this notification as read"}), 403
        
        notification.is_read = True
        db.session.commit()
        return jsonify({"message": "Notification marked as read"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error marking notification as read: {str(e)}"}), 500

def delete_notification(notification_id, user_id):
    try:
        notification = Notifications.query.get(notification_id)
        if not notification:
            return jsonify({"message": "Notification not found"}), 404
    
        if notification.user_id != user_id:
            return jsonify({"message": "Unauthorized to delete this notification"}), 403
    
        db.session.delete(notification)
        db.session.commit()
        return jsonify({"message": "Notification deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error deleting notification: {str(e)}"}), 500
    
def send_notification(user_id, notification_body, notification_type, source_id=None, source_type=None):
    try:
        if not user_id:
            return {"message": "User ID is required"}, 400

        # Check for existing notification with the same user, type, source_id, and source_type
        existing_notification = Notifications.query.filter_by(
            user_id=user_id,
            type=notification_type,
            source_id=source_id,
            source_type=source_type
        ).first()

        if existing_notification:
            existing_notification.created_at = datetime.now(timezone.utc) # Update timestamp
        else:
            new_notification = Notifications(user_id=user_id, content=notification_body, type=notification_type, source_id=source_id, source_type=source_type)
            db.session.add(new_notification)
        db.session.commit()
        return {"message": "Notification added successfully"}, 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding notification: {str(e)}")
        return {"message": f"Error adding notification: {str(e)}"}, 500