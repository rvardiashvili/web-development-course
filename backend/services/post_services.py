from database.database import db
from models.social.posts import Posts # Assuming this path to your Posts model
from models.users import Users, Followers # Assuming this path to your Users and Followers model
from models.social.groups import Group, GroupMembership # Assuming this path to your Group model
from models.social.posts import liked_by # Import the liked_by model
from datetime import datetime, timezone
from flask import current_app # Import current_app for logging
from flask_login import current_user
import os
import uuid # For generating unique filenames
from werkzeug.utils import secure_filename # Import secure_filename for safe filenames
from sqlalchemy import func, or_, and_ # Import func, or_, and 'and_' for complex queries
from .notifications_services import send_notification

# Assuming UPLOAD_FOLDER and UPLOAD_PATH are defined in your config.py
# If not, you might need to define them here or ensure they are accessible.
# For this example, I'll assume they are imported from a config file as per your example.
try:
    from config import UPLOAD_FOLDER, UPLOAD_PATH # Import from your config file
except ImportError:
    # Fallback if config.py is not set up this way, for local testing/development
    # In a real application, ensure these are properly configured.
    UPLOAD_FOLDER = 'static/uploads'
    UPLOAD_PATH = '/static/uploads'
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)


# Helper function to serialize a Post object to a dictionary
def _serialize_post(post, current_user_id=None, like_count=None):
    """
    Serializes a Posts SQLAlchemy object into a dictionary suitable for JSON response.
    Includes related User and Group data by explicitly querying if not already loaded.
    Infers 'post_type' based on media_url if no dedicated column exists.
    Includes like count and current user's like status.
    Accepts an optional pre-calculated like_count for efficiency.
    """
    if not post:
        return None

    post_dict = {
        'post_id': post.post_id,
        'user_id': post.user_id,
        'content': post.content,
        'visibility': post.visibility,
        'media_url': post.media_url,
        'created_at': post.created_at.isoformat() if post.created_at else None,
    }

    # Infer post_type based on media_url
    if post.media_url:
        ext = os.path.splitext(post.media_url)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            post_dict['post_type'] = 'image'
        elif ext in ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm']:
            post_dict['post_type'] = 'video'
        else:
            post_dict['post_type'] = 'article' # Default if media but unknown type
    else:
        post_dict['post_type'] = 'article' # Default if no media

    # Include user details: Try to use loaded relationship, otherwise query directly
    user_obj = None
    if hasattr(post, 'user') and post.user: # Check if 'user' relationship is loaded
        user_obj = post.user
    else:
        user_obj = Users.query.get(post.user_id) # Explicitly query if not loaded

    if user_obj:
        post_dict['user'] = {
            'user_id': user_obj.user_id,
            'username': user_obj.username,
            'full_name': user_obj.full_name,
            'profile_picture': user_obj.profile_picture
            # Add other user fields you want to expose from the Users model
        }
    else:
        post_dict['user'] = None

    # Include group details if applicable: Try to use loaded relationship, otherwise query directly
    if post.group_id:
        group_obj = None
        if hasattr(post, 'group') and post.group: # Check if 'group' relationship is loaded
            group_obj = post.group
        else:
            group_obj = Group.query.get(post.group_id) # Explicitly query if not loaded

        if group_obj:
            post_dict['group'] = {
                'group_id': group_obj.group_id,
                'name': group_obj.name,
                # Add other group fields you want to expose from the Group model
            }
        else:
            post_dict['group'] = None
    else:
        post_dict['group'] = None

    # Add like count, using the pre-calculated one if available
    if like_count is not None:
        post_dict['like_count'] = like_count
    else:
        # Fallback for other uses of this function where like_count isn't pre-fetched
        post_dict['like_count'] = db.session.query(func.count(liked_by.post_id)).filter_by(post_id=post.post_id).scalar()


    # Add current user's like status if current_user_id is provided
    if current_user_id:
        user_liked = db.session.query(liked_by).filter_by(post_id=post.post_id, user_id=current_user_id).first()
        post_dict['user_liked'] = True if user_liked else False
        post_dict['user_emote_type'] = user_liked.emote_type if user_liked else None
    else:
        post_dict['user_liked'] = False
        post_dict['user_emote_type'] = None

    # Mark if the post belongs to the current user
    if current_user_id and post.user_id == current_user_id:
        post_dict['is_own_post'] = True
    else:
        post_dict['is_own_post'] = False

    return post_dict

def _save_media_file(media_file, user_id):
    """
    Saves an uploaded media file to a user-specific subfolder within UPLOAD_FOLDER
    and returns its relative URL.
    Generates a unique filename to prevent collisions.
    """
    if not media_file:
        return None

    # Sanitize the filename
    original_filename = secure_filename(media_file.filename)
    # Generate a unique UUID for the filename to prevent collisions
    unique_filename = str(uuid.uuid4()) + os.path.splitext(original_filename)[1]

    # Create a user-specific subfolder within the UPLOAD_FOLDER
    user_folder_path = os.path.join(UPLOAD_FOLDER, f"user_{user_id}")
    os.makedirs(user_folder_path, exist_ok=True) # Ensure the directory exists

    # Construct the full file path where the file will be saved
    filepath = os.path.join(user_folder_path, unique_filename)

    # Construct the relative URL path to be stored in the database
    # This path is what the web server will use to serve the file
    relative_path = os.path.join(UPLOAD_PATH, f"user_{user_id}", unique_filename).replace('\\', '/') # Use forward slashes for URLs

    try:
        media_file.save(filepath)
        current_app.logger.info(f"Media file saved to: {filepath}")
        return relative_path
    except Exception as e:
        current_app.logger.error(f"Error saving media file {unique_filename} for user {user_id}: {e}")
        return None

def get_post(post_id, current_user_id=None):
    """
    Retrieves a single post by its ID.
    NOTE: This function currently implements only basic visibility checks.
    For a real-world application, comprehensive authorization logic (e.g., checking
    follower status, group membership, or user roles) must be added here,
    likely by passing the `current_user` object from the route.
    """
    try:
        # Fetch the post. Relationships (user, group) will be lazily loaded by default
        # or can be explicitly queried in _serialize_post if needed.
        post = Posts.query.get(post_id)

        if not post:
            return {'status': 'error', 'message': 'Post not found.', 'code': 404}

        # Basic visibility check (expand this for full authorization)
        # if post.visibility == 'private' and post.user_id != requesting_user_id:
        #     return {'status': 'error', 'message': 'Unauthorized to view this post.', 'code': 403}
        # if post.visibility == 'group' and not is_user_member_of_group(requesting_user_id, post.group_id):
        #     return {'status': 'error', 'message': 'Unauthorized to view this post.', 'code': 403}

        return {'status': 'success', 'post': _serialize_post(post, current_user_id)}
    except Exception as e:
        db.session.rollback() # Rollback in case of any database error
        current_app.logger.error(f"Error fetching post {post_id}: {e}")
        return {'status': 'error', 'message': f'An error occurred: {str(e)}', 'code': 500}

def create_post(post_data):
    """
    Creates a new post.
    post_data is expected to be a dictionary from request.form, potentially including 'media_file' from request.files.
    Requires 'user_id', 'content', 'visibility'. 'group_id' and 'media_file' are optional.
    The 'post_type' is no longer stored in the DB but can be inferred from 'media_url'.
    """
    # Basic validation
    user_id = post_data.get('user_id')
    content = post_data.get('content')
    visibility = post_data.get('visibility')
    media_file = post_data.get('media_file') # This will be the FileStorage object

    if not all([user_id, content, visibility]):
        return {'status': 'error', 'message': 'Missing required fields: user_id, content, visibility.', 'code': 400}

    # Validate user_id exists
    user_exists = Users.query.get(user_id)
    if not user_exists:
        return {'status': 'error', 'message': 'User does not exist.', 'code': 404}

    # Validate group_id if provided
    group_id = post_data.get('group_id')
    if group_id:
        group_exists = Group.query.get(group_id)
        if not group_exists:
            return {'status': 'error', 'message': 'Group does not exist.', 'code': 404}

        is_member = GroupMembership.query.filter_by(group_id=group_id, user_id=user_id).first()
        if not is_member:
            return {'status': 'error', 'message': 'User is not a member of this group.', 'code': 403}

    # Validate visibility based on the new schema
    allowed_visibilities = ['public', 'followers', 'group']
    if visibility not in allowed_visibilities:
        return {'status': 'error', 'message': f"Invalid visibility: {visibility}. Must be one of {', '.join(allowed_visibilities)}.", 'code': 400}

    media_url = None
    if media_file:
        # Pass user_id to _save_media_file for user-specific folder creation
        media_url = _save_media_file(media_file, user_id)
        if not media_url:
            return {'status': 'error', 'message': 'Failed to save media file.', 'code': 500}

    try:
        new_post = Posts(
            user_id=user_id,
            group_id=group_id,
            content=content,
            visibility=visibility,
            media_url=media_url, # Use the generated media_url
            created_at=datetime.now(timezone.utc) # Ensure timestamp is set to UTC
        )
        db.session.add(new_post)
        db.session.commit()
        return {'status': 'success', 'message': 'Post created successfully.', 'post_id': new_post.post_id, 'code': 201}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating post: {e}")
        return {'status': 'error', 'message': f'Failed to create post: {str(e)}', 'code': 500}

def get_post_list(current_user_id, filters={}, page=1, per_page=500):
    """
    Retrieves a personalized, paginated list of posts. This function is now
    context-aware and handles three main scenarios:
    1. Viewing a specific group's feed.
    2. Viewing a specific user's profile feed.
    3. Viewing the current user's personalized home feed.
    It also applies sorting and post type filters in all contexts.
    """
    try:
        query = None
        
        # --- Context 1: Viewing a specific Group's feed ---
        if 'group_id' in filters:
            group_id = filters['group_id']
            # Authorization: Check if the current user is a member of the group
            is_member = GroupMembership.query.filter_by(group_id=group_id, user_id=current_user_id).first()
            if not is_member:
                return {'status': 'error', 'message': 'You are not a member of this group.', 'code': 403}
            # A group member can see all posts within that group.
            query = Posts.query.filter(Posts.group_id == group_id)

        # --- Context 2: Viewing a specific User's profile feed ---
        elif 'user_id' in filters:
            target_user_id = filters['user_id']
            
            # Determine relationship to the target user for visibility
            visible_statuses = ['public'] # Strangers can see public posts
            if current_user_id:
                if int(current_user_id) == int(target_user_id):
                    # User is viewing their own profile, can see everything
                    visible_statuses.extend(['followers', 'group'])
                else:
                    # Check if current user follows the target user
                    is_following = Followers.query.filter_by(follower_id=current_user_id, followed_id=target_user_id).first()
                    if is_following:
                        visible_statuses.append('followers')
            
            query = Posts.query.filter(
                and_(
                    Posts.user_id == target_user_id,
                    Posts.visibility.in_(visible_statuses)
                )
            )

        # --- Context 3: Viewing the personalized Home feed (default) ---
        else:
            followed_user_ids = [f.followed_id for f in Followers.query.filter_by(follower_id=current_user_id).all()]
            member_of_group_ids = [gm.group_id for gm in GroupMembership.query.filter_by(user_id=current_user_id).all()]

            # Build the OR conditions for the home feed
            home_feed_conditions = [
                # 1. All posts from groups the user is a member of.
                Posts.group_id.in_(member_of_group_ids),
                # 2. All of the user's own posts (that aren't in groups already covered above).
                and_(Posts.user_id == current_user_id, Posts.group_id == None),
                # 3. 'public' and 'followers' posts from people they follow (that aren't in groups).
                and_(
                    Posts.user_id.in_(followed_user_ids),
                    Posts.visibility.in_(['public', 'followers']),
                    Posts.group_id == None
                ),
                # 4. Any 'public' post from anyone, including from groups they are NOT a member of.
                Posts.visibility == 'public'
            ]
            query = Posts.query.filter(or_(*home_feed_conditions))
        
        # --- Apply post_type filter to the determined query context ---
        post_type = filters.get('post_type')
        if post_type == 'articles':
            query = query.filter(Posts.media_url == None)
        elif post_type == 'images':
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
            query = query.filter(or_(*[Posts.media_url.ilike(f'%{ext}') for ext in image_extensions]))
        elif post_type == 'videos':
            video_extensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm']
            query = query.filter(or_(*[Posts.media_url.ilike(f'%{ext}') for ext in video_extensions]))

        # --- Apply sorting logic ---
        sort_by = filters.get('sort_by', 'Recent')
        if sort_by == 'top':
            likes_count_subquery = db.session.query(
                liked_by.post_id,
                func.count(liked_by.user_id).label('like_count')
            ).group_by(liked_by.post_id).subquery()
            query = query.add_columns(func.coalesce(likes_count_subquery.c.like_count, 0).label('total_likes'))
            query = query.outerjoin(likes_count_subquery, Posts.post_id == likes_count_subquery.c.post_id)
            query = query.order_by(db.desc('total_likes'), Posts.created_at.desc())
        else: # Default to 'Recent'
            query = query.order_by(Posts.created_at.desc())
        # --- Paginate and Serialize ---
        paginated_results = query.paginate(page=page, per_page=per_page, error_out=False)
        results = paginated_results.items

        if not results:
            return {'status': 'info', 'message': 'No posts found matching the criteria.', 'posts': [], 'code': 200}
        serialized_posts = []
        if sort_by == 'top':
            for row in results:
                serialized_posts.append(_serialize_post(row[0], current_user_id, like_count=row[1]))
        else:
            for post in results:
                serialized_posts.append(_serialize_post(post, current_user_id))
        if "post_id" in filters:
            result = query.filter_by(post_id=filters["post_id"]).first()
            serialized_posts = [_serialize_post(result, current_user_id)]
            print(result)

        
        return {
            'status': 'success',
            'posts': serialized_posts,
            'pagination': {
                'page': paginated_results.page,
                'per_page': paginated_results.per_page,
                'total_pages': paginated_results.pages,
                'total_items': paginated_results.total
            },
            'code': 200
        }

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error fetching post list for user {current_user_id}: {e}")
        return {'status': 'error', 'message': f'An error occurred: {str(e)}', 'code': 500}


def like_post(post_id, user_id, emote_type='like'):
    try:
        post = Posts.query.get(post_id)
        if not post:
            return {'status': 'error', 'message': 'Post not found.', 'code': 404}

        existing_like = liked_by.query.filter_by(post_id=post_id, user_id=user_id).first()
        if existing_like:
            if existing_like.emote_type == emote_type:
                return {'status': 'info', 'message': 'Post already liked with this emote type.', 'code': 200}
            else:
                # Update emote type if already liked by the user with a different emote
                existing_like.emote_type = emote_type
                existing_like.liked_at = datetime.now(timezone.utc) # Update timestamp
                db.session.commit()
                return {'status': 'success', 'message': 'Emote updated successfully.', 'code': 200, 'action': 'updated'}
        else:
            new_like = liked_by(post_id=post_id, user_id=user_id, emote_type=emote_type, liked_at=datetime.now(timezone.utc))
            db.session.add(new_like)
            db.session.commit()
            send_notification(post.user_id, f"Your post has been liked by {current_user.username}", "New Like", post_id, "post")
            return {'status': 'success', 'message': 'Post liked successfully.', 'code': 201, 'action': 'liked'}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error liking post {post_id} by user {user_id}: {e}")
        return {'status': 'error', 'message': f'Failed to like post: {str(e)}', 'code': 500}

def unlike_post(post_id, user_id):
    """
    Removes a user's like/emote from a post.
    """
    try:
        like_entry = liked_by.query.filter_by(post_id=post_id, user_id=user_id).first()
        if not like_entry:
            return {'status': 'info', 'message': 'Post not liked by this user.', 'code': 200}

        db.session.delete(like_entry)
        db.session.commit()
        return {'status': 'success', 'message': 'Post unliked successfully.', 'code': 200}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error unliking post {post_id} by user {user_id}: {e}")
        return {'status': 'error', 'message': f'Failed to unlike post: {str(e)}', 'code': 500}

def get_like_status(post_id, user_id):
    """
    Checks if a user has liked a specific post and returns the total like count.
    """
    try:
        post = Posts.query.get(post_id)
        if not post:
            return {'status': 'error', 'message': 'Post not found.', 'code': 404}

        like_count = liked_by.query.filter_by(post_id=post_id).count()
        user_liked_entry = liked_by.query.filter_by(post_id=post_id, user_id=user_id).first()

        return {
            'status': 'success',
            'post_id': post_id,
            'like_count': like_count,
            'user_liked': True if user_liked_entry else False,
            'user_emote_type': user_liked_entry.emote_type if user_liked_entry else None,
            'code': 200
        }
    except Exception as e:
        current_app.logger.error(f"Error getting like status for post {post_id} by user {user_id}: {e}")
        return {'status': 'error', 'message': f'Failed to get like status: {str(e)}', 'code': 500}

def delete_post(post_id, user_id):
    """
    Deletes a post. Only the owner of the post can delete it.
    If the post has an associated media file, it will also be deleted from the filesystem.
    """
    try:
        post = Posts.query.filter_by(post_id=post_id, user_id=user_id).first()
        if not post:
            return {'status': 'error', 'message': 'Post not found or you do not have permission to delete it.', 'code': 404}

        # Delete associated media file if it exists
        if post.media_url:
            # Construct the absolute path to the file from the app's root directory
            # This assumes UPLOAD_PATH starts with a directory in the app's static folder
            filepath = os.path.join(current_app.root_path, 'static', post.media_url.split('/static/')[-1])
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                    current_app.logger.info(f"Deleted media file: {filepath}")
                except OSError as e:
                    current_app.logger.error(f"Error deleting media file {filepath}: {e}")


        db.session.delete(post)
        db.session.commit()
        return {'status': 'success', 'message': 'Post deleted successfully.', 'code': 200}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting post {post_id} by user {user_id}: {e}")
        return {'status': 'error', 'message': f'Failed to delete post: {str(e)}', 'code': 500}
