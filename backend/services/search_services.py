from database.database import db 
from models.users import Users
from models.employee.employees import Employee
from models.employer.employers import Employer
from models.social.groups import Group
from models.social.posts import Posts
from models.employer.job_postings import JobPostings

def search_users(query):
    return Users.query.filter(
        db.or_(
            Users.username.ilike(f'%{query}%'),
            Users.full_name.ilike(f'%{query}%')
        )
    ).limit(10).all()

def search_groups(query):
    return Group.query.filter(
        Group.name.ilike(f'%{query}%')
    ).limit(10).all()

def search_employers(query):
    return Employer.query.filter(
        Employer.business_name.ilike(f'%{query}%')
    ).limit(10).all()

def search_posts(query):
    return Posts.query.filter(
        Posts.content.ilike(f'%{query}%')
    ).limit(10).all()

def search_job_postings(query):
    return JobPostings.query.filter(
        db.or_(
            JobPostings.title.ilike(f'%{query}%'),
            JobPostings.description.ilike(f'%{query}%'),
            JobPostings.position.ilike(f'%{query}%')
        )
    ).limit(10).all()