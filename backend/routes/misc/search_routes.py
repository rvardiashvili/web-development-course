from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required
from database.database import db  # Assuming your database instance
from models.users import Users
from models.employee.employees import Employee
from models.employer.employers import Employer
from models.social.groups import Group
from models.social.posts import Posts
from models.employer.job_postings import JobPostings
from services.search_services import search_users, search_groups, search_employers, search_posts, search_job_postings

search_bp = Blueprint('search', __name__, url_prefix='/search')

@search_bp.route('/live_search', methods=['GET'])
def live_search():
    query = request.args.get('q')
    if not query:
        return jsonify({'users': [], 'groups': [], 'employers': [], 'posts': [], 'job_postings': []})

    results = {
        'users': [{'username': user.username, 'full_name': user.full_name, 'profile_pic_path': user.profile_picture} for user in search_users(query)],
        'groups': [{'id': group.group_id, 'name': group.name} for group in search_groups(query)],
        'employers': [{'id': employer.user_id, 'business_name': employer.business_name} for employer in search_employers(query)],
        'posts': [{'id': post.post_id, 'content': post.content[:100]} for post in search_posts(query)],
        'job_postings': [{'id': job.job_id, 'title': job.title, 'employer_name': job.employer.business_name if job.employer else None} for job in search_job_postings(query)],
    }

    return jsonify(results)