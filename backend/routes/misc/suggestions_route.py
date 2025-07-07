from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from services.suggestions_services import get_suggestions 

suggestions_bp = Blueprint('suggestions', __name__, url_prefix='/suggestions')

@suggestions_bp.route('/')
@login_required
def get_feed_suggestions():
    current_user_id = current_user.user_id
    if not current_user_id:
        return jsonify([]), 200 
    suggestions = get_suggestions(current_user_id)
    return jsonify(suggestions)
