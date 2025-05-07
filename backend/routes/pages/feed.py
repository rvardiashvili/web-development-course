from flask import Blueprint, request, render_template

feed_bp = Blueprint('feed', __name__, url_prefix='/feed')

@feed_bp.route('/')
def feed():
    return render_template('feed.html')
