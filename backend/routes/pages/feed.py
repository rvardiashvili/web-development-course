from flask import Blueprint, request, render_template

feed_bp = Blueprint('feed', __name__, url_prefix='/feed')

@feed_bp.route('/')
def feed():
    return render_template('feed.html')

@feed_bp.route('/community')
def community():
    return render_template('components/community.html')
