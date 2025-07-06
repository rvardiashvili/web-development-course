from flask import Blueprint, request, jsonify, render_template
from services import post_services # Assuming this is where your post-related service functions are
# Assuming current_user is available from Flask-Login or similar authentication setup
from flask_login import current_user, login_required

posts_bp = Blueprint('post', __name__, url_prefix='/post')

@posts_bp.route('/<int:post_id>', methods=['GET'])
def serve_post(post_id): # Corrected: post_id parameter added to function signature
    """
    Retrieves and serves a single post by its ID.
    Assumes post_services.get_post returns a dictionary/object that can be JSONified.
    """
    print(f"Received request for post ID: {post_id}")
    # Pass current_user_id to get_post for like status
    current_user_id = current_user.user_id if current_user.is_authenticated else None
    post_data = post_services.get_post(post_id, current_user_id=current_user_id)

    if post_data and post_data.get('status') == 'success':
        return jsonify(post_data), 200
    else:
        # Handle cases where the post is not found or service failed
        status_code = 404 if post_data and 'not found' in post_data.get('message', '').lower() else 500
        return jsonify(post_data or {'status': 'error', 'message': 'Failed to retrieve post.'}), status_code

@posts_bp.route('/', methods=['POST']) # Changed route to '/' for creating new posts under /post
@login_required # Ensure user is logged in to create a post
def create_post():
    """
    Creates a new post from form data (including files).
    Requires Flask-Login's current_user for user ID.
    """
    content = request.form.get('content')
    visibility = request.form.get('visibility')
    post_type = request.form.get('post_type') # This is the inferred type from JS
    media_file = request.files.get('media') # Get the uploaded file

    user_id = current_user.user_id # Get user_id from Flask-Login's current_user

    # --- ADDED PRINT STATEMENT FOR DEBUGGING ---
    print(f"DEBUG: Flask received from frontend - content='{content}', visibility='{visibility}', post_type='{post_type}', user_id='{user_id}'")
    if media_file:
        print(f"DEBUG: Received media file: {media_file.filename} ({media_file.mimetype})")
    # --- END DEBUG PRINT ---

    if not content:
        return jsonify({'status': 'error', 'message': 'Post content is required.'}), 400
    # user_id check is implicitly handled by @login_required

    # Prepare data for your service function
    post_data_for_service = {
        'user_id': user_id,
        'content': content,
        'visibility': visibility,
        'media_file': media_file
    }

    result = post_services.create_post(post_data_for_service) # Pass the collected data

    if result['status'] == 'success':
        return jsonify(result), 201 # 201 Created for successful resource creation
    else:
        return jsonify(result), 400 # 400 Bad Request for client-side errors or other errors

@posts_bp.route('/', methods=['GET']) # Changed route to '/' for getting a list of posts
def get_post_list():
    """
    Retrieves a list of posts, potentially filtered by query parameters.
    Assumes post_services.get_post_list returns a dictionary/object that can be JSONified.
    """
    # Corrected: Get filters from request.args (query parameters)
    filters = request.args.to_dict()
    print(f"Received filters for post list: {filters}")

    # Pass current_user.user_id for authorization in service layer if available
    current_user_id = current_user.user_id if current_user.is_authenticated else None

    post_list_data = post_services.get_post_list(filters, current_user_id=current_user_id)

    if post_list_data and post_list_data.get('status') == 'success':
        return jsonify(post_list_data), 200
    else:
        # Handle cases where no posts are found or service failed
        status_code = 500 # Default to 500 for service errors
        if post_list_data and 'message' in post_list_data:
            if 'no posts found' in post_list_data['message'].lower():
                status_code = 404 # No content found
        return jsonify(post_list_data or {'status': 'error', 'message': 'Failed to retrieve post list.'}), status_code

@posts_bp.route('/<int:post_id>/like', methods=['POST'])
@login_required
def like_post_route(post_id):
    """
    Handles liking a post.
    Requires 'emote_type' in the request JSON (e.g., 'like', 'heart', 'laugh').
    """
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Request must be JSON'}), 400

    emote_type = request.json.get('emote_type', 'like') # Default to 'like'
    user_id = current_user.user_id

    result = post_services.like_post(post_id, user_id, emote_type)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 400 # Or 404 if post not found, 409 if already liked

@posts_bp.route('/<int:post_id>/unlike', methods=['POST'])
@login_required
def unlike_post_route(post_id):
    """
    Handles unliking a post.
    """
    user_id = current_user.user_id

    result = post_services.unlike_post(post_id, user_id)

    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 400 # Or 404 if post not found, 409 if not liked

@posts_bp.route('/<int:post_id>/like_status', methods=['GET'])
@login_required
def get_like_status_route(post_id):
    """
    Checks if the current user has liked a specific post and returns the like count.
    """
    user_id = current_user.user_id

    like_status_data = post_services.get_like_status(post_id, user_id)

    if like_status_data['status'] == 'success':
        return jsonify(like_status_data), 200
    else:
        return jsonify(like_status_data), 404 # Post not found or other error
