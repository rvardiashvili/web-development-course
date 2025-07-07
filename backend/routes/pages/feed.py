from flask import Blueprint, request, render_template

feed_bp = Blueprint('feed', __name__, url_prefix='/feed')

@feed_bp.route('/')
def feed():
    # This route will render the main feed page.
    # If a community ID is present in the session or URL, it can be passed here.
    return render_template('feed.html')

@feed_bp.route('/community/<int:community_id>')
def community_page(community_id):
    """
    Renders the main feed.html template when a direct URL to a community is accessed.
    The community_id is passed to the template for client-side loading.
    """
    return render_template('feed.html', initial_community_id=community_id)

@feed_bp.route('/components/community_content')
def get_community_content():
    """
    Returns only the HTML content of the community component.
    This is used for client-side dynamic loading.
    """
    return render_template('components/community.html')

