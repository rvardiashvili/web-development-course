import os
from werkzeug.utils import secure_filename
from flask import current_app 
from database.database import db
from models.users import Users, UserType, Followers 
from models.employee.employees import Employee 
from models.employee.work_experience import WorkExperience
from models.employee.project import Project
from models.employee.education import Education
from models.employee.resume import Resume
from config import UPLOAD_FOLDER, UPLOAD_PATH, ALLOWED_EXTENSIONS
from datetime import datetime
from sqlalchemy.types import JSON 

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
def allowed_file_pdf(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {"pdf", }

def upload_profile_picture(user, file):
    """Handles uploading and updating user profile picture."""
    if not file or not allowed_file(file.filename):
        return {'status': 'error', 'message': 'Invalid file type or no file selected.'}

    filename = secure_filename(file.filename)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, f"{user.user_id}_{filename}")
    relative_path = os.path.join(UPLOAD_PATH, f"{user.user_id}_{filename}")

    try:
        if user.profile_picture and user.profile_picture != '/static/media/default/pfp.jpg':
             old_filepath = os.path.join(current_app.root_path, user.profile_picture.lstrip('/'))
             if os.path.exists(old_filepath):
                 os.remove(old_filepath)

        file.save(filepath)
        user.profile_picture = relative_path
        db.session.commit()
        return {'status': 'success', 'message': 'Profile picture uploaded successfully!', 'profile_picture_url': relative_path}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error uploading profile picture for user {user.user_id}: {e}")
        return {'status': 'error', 'message': f'Error saving file: {e}'}

def delete_profile_picture(user):
    """Handles deleting user profile picture."""
    if not user.profile_picture or user.profile_picture == '/static/media/default/pfp.jpg':
        return {'status': 'info', 'message': 'No profile picture to delete.'}

    filepath = os.path.join(current_app.root_path, user.profile_picture.lstrip('/'))

    try:
        if os.path.exists(filepath):
            os.remove(filepath)
        user.profile_picture = None
        db.session.commit()
        return {'status': 'success', 'message': 'Profile picture deleted successfully!', 'profile_picture_url': '/static/media/default/pfp.jpg'}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting profile picture for user {user.user_id}: {e}")
        return {'status': 'error', 'message': f'Error deleting file: {e}'}

def update_user_bio(user, bio_text):
    """Updates the user's bio."""
    try:
        user.bio = bio_text
        db.session.commit()
        return {'status': 'success', 'message': 'Bio updated successfully!', 'bio': user.bio}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating bio for user {user.user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating bio: {e}'}

def add_work_experience(user_id, data):
    """Adds a new work experience entry for an employee."""
    try:
        employee = Employee.query.filter_by(user_id=user_id).first()
        if not employee:
             return {'status': 'error', 'message': 'Employee profile not found.'}

        try:
            start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None
        except ValueError:
             return {'status': 'error', 'message': 'Invalid date format. UseYYYY-MM-DD.'}

        new_experience = WorkExperience(
            user_id=user_id,
            job_title=data.get('title'), 
            company=data.get('company'),
            location=data.get('location'),
            start_date=start_date,
            end_date=end_date,
            description=data.get('description')
        )
        db.session.add(new_experience)
        db.session.commit()
        # Return the newly created entry data including its ID
        return {
            'status': 'success',
            'message': 'Work experience added successfully!',
            'data': {
                'id': new_experience.experience_id,
                'title': new_experience.job_title,
                'company': new_experience.company,
                'location': new_experience.location,
                'start_date': new_experience.start_date.isoformat(),
                'end_date': new_experience.end_date.isoformat() if new_experience.end_date else None,
                'description': new_experience.description
            }
        }
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding work experience for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error adding work experience: {e}'}

def update_work_experience(experience_id, user_id, data):
    """Updates an existing work experience entry for an employee."""
    try:
        experience = WorkExperience.query.filter_by(experience_id=experience_id, user_id=user_id).first()
        if not experience:
            return {'status': 'error', 'message': 'Work experience entry not found or does not belong to user.'}

         # Parse dates
        try:
            experience.start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
            experience.end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None
        except ValueError:
             return {'status': 'error', 'message': 'Invalid date format. UseYYYY-MM-DD.'}

        experience.job_title = data.get('title', experience.job_title) # Use 'title'
        experience.company = data.get('company', experience.company)
        experience.location = data.get('location', experience.location)
        experience.description = data.get('description', experience.description)

        db.session.commit()
        # Return the updated entry data
        return {
            'status': 'success',
            'message': 'Work experience updated successfully!',
            'data': {
                'id': experience.experience_id,
                'title': experience.job_title,
                'company': experience.company,
                'location': experience.location,
                'start_date': experience.start_date.isoformat(),
                'end_date': experience.end_date.isoformat() if experience.end_date else None,
                'description': experience.description
            }
        }
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating work experience {experience_id} for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating work experience: {e}'}

def delete_work_experience(experience_id, user_id):
    """Deletes a work experience entry for an employee."""
    try:
        experience = WorkExperience.query.filter_by(experience_id=experience_id, user_id=user_id).first()
        if not experience:
            return {'status': 'error', 'message': 'Work experience entry not found or does not belong to user.'}

        db.session.delete(experience)
        db.session.commit()
        return {'status': 'success', 'message': 'Work experience deleted successfully!'}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting work experience {experience_id} for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error deleting work experience: {e}'}

# --- Implement similar service functions for Projects and Education ---

def add_project(user_id, data):
     """Adds a new project entry for an employee."""
     try:
        employee = Employee.query.filter_by(user_id=user_id).first()
        if not employee:
             return {'status': 'error', 'message': 'Employee profile not found.'}

        new_project = Project(
            user_id=user_id,
            title=data.get('title'),
            description=data.get('description'),
            technologies=data.get('technologies'),
            link=data.get('link')
        )
        db.session.add(new_project)
        db.session.commit()
        # Return the newly created entry data including its ID
        return {
            'status': 'success',
            'message': 'Project added successfully!',
            'data': {
                'id': new_project.project_id,
                'title': new_project.title,
                'description': new_project.description,
                'technologies': new_project.technologies,
                'link': new_project.link
            }
        }
     except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding project for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error adding project: {e}'}


def update_project(project_id, user_id, data):
     """Updates an existing project entry for an employee."""
     try:
        project = Project.query.filter_by(project_id=project_id, user_id=user_id).first()
        if not project:
            return {'status': 'error', 'message': 'Project entry not found or does not belong to user.'}

        project.title = data.get('title', project.title)
        project.description = data.get('description', project.description)
        project.technologies = data.get('technologies', project.technologies)
        project.link = data.get('link', project.link)

        db.session.commit()
        # Return the updated entry data
        return {
            'status': 'success',
            'message': 'Project updated successfully!',
            'data': {
                'id': project.project_id,
                'title': project.title,
                'description': project.description,
                'technologies': project.technologies,
                'link': project.link
            }
        }
     except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating project {project_id} for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating project: {e}'}

def delete_project(project_id, user_id):
     """Deletes a project entry for an employee."""
     try:
        project = Project.query.filter_by(project_id=project_id, user_id=user_id).first()
        if not project:
            return {'status': 'error', 'message': 'Project entry not found or does not belong to user.'}

        db.session.delete(project)
        db.session.commit()
        return {'status': 'success', 'message': 'Project deleted successfully!'}
     except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting project {project_id} for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error deleting project: {e}'}

# --- Education Service Functions ---

def add_education(user_id, data):
     """Adds a new education entry for an employee."""
     try:
        employee = Employee.query.filter_by(user_id=user_id).first()
        if not employee:
             return {'status': 'error', 'message': 'Employee profile not found.'}

        new_education = Education(
            user_id=user_id,
            degree=data.get('degree'),
            institution=data.get('institution'),
            field_of_study=data.get('field_of_study'),
            year_of_completion=data.get('year_of_completion'),
            notes=data.get('notes')
        )
        db.session.add(new_education)
        db.session.commit()
        # Return the newly created entry data including its ID
        return {
            'status': 'success',
            'message': 'Education added successfully!',
            'data': {
                'id': new_education.education_id,
                'degree': new_education.degree,
                'institution': new_education.institution,
                'field_of_study': new_education.field_of_study,
                'year_of_completion': new_education.year_of_completion,
                'notes': new_education.notes
            }
        }
     except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error adding education for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error adding education: {e}'}

def update_education(education_id, user_id, data):
     """Updates an existing education entry for an employee."""
     try:
        education = Education.query.filter_by(education_id=education_id, user_id=user_id).first()
        if not education:
            return {'status': 'error', 'message': 'Education entry not found or does not belong to user.'}

        education.degree = data.get('degree', education.degree)
        education.institution = data.get('institution', education.institution)
        education.field_of_study = data.get('field_of_study', education.field_of_study)
        education.year_of_completion = data.get('year_of_completion', education.year_of_completion)
        education.notes = data.get('notes', education.notes)

        db.session.commit()
        # Return the updated entry data
        return {
            'status': 'success',
            'message': 'Education updated successfully!',
            'data': {
                'id': education.education_id,
                'degree': education.degree,
                'institution': education.institution,
                'field_of_study': education.field_of_study,
                'year_of_completion': education.year_of_completion,
                'notes': education.notes
            }
        }
     except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating education {education_id} for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating education: {e}'}

def delete_education(education_id, user_id):
     """Deletes an education entry for an employee."""
     try:
        education = Education.query.filter_by(education_id=education_id, user_id=user_id).first()
        if not education:
            return {'status': 'error', 'message': 'Education entry not found or does not belong to user.'}

        db.session.delete(education)
        db.session.commit()
        return {'status': 'success', 'message': 'Education deleted successfully!'}
     except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting education {education_id} for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error deleting education: {e}'}


# --- Skills and Interests Service Functions ---

def update_employee_skills(user_id, skills_text):
    """Updates the employee's skills."""
    try:
        employee = Employee.query.filter_by(user_id=user_id).first()
        if not employee:
             return {'status': 'error', 'message': 'Employee profile not found.'}

        employee.skills = skills_text
        db.session.commit()
        return {'status': 'success', 'message': 'Skills updated successfully!', 'skills': employee.skills}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating skills for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating skills: {e}'}

def update_employee_interests(user_id, interests_text):
    """Updates the employee's interests."""
    try:
        employee = Employee.query.filter_by(user_id=user_id).first()
        if not employee:
             return {'status': 'error', 'message': 'Employee profile not found.'}

        employee.interests = interests_text
        db.session.commit()
        return {'status': 'success', 'message': 'Interests updated successfully!', 'interests': employee.interests}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating interests for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating interests: {e}'}

# --- New Languages Service Function ---
def update_employee_languages(user_id, languages_text):
    """Updates the employee's languages."""
    try:
        employee = Employee.query.filter_by(user_id=user_id).first()
        if not employee:
             return {'status': 'error', 'message': 'Employee profile not found.'}

        employee.languages = languages_text
        db.session.commit()
        return {'status': 'success', 'message': 'Languages updated successfully!', 'languages': employee.languages}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating languages for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating languages: {e}'}


# --- Function to fetch full profile data ---
def get_user_profile_data(user_id):
    user = Users.query.get(user_id)
    if not user:
         # Return an error status if user is not found
         return {'status': 'error', 'message': 'User profile not found.'}

    profile_data = {
        'user_id': user.user_id,
        'full_name': user.full_name,
        'email': user.email,
        'username': user.username,
        'profile_picture': user.profile_picture,
        'bio': user.bio,
        'user_type': user.user_type,
        'user_flags': user.user_flags,
    }

    if user.user_type == UserType.employee: # Use Enum value for comparison
         employee_info = Employee.query.filter_by(user_id=user_id).first() # Use filter_by for one-to-one relationship if not using get()
         if employee_info:
              print(employee_info.date_of_birth.isoformat())
              profile_data['employee_details'] = {
                   'date_of_birth': employee_info.date_of_birth.isoformat() if employee_info.date_of_birth else None,
                   'mobile_number': employee_info.mobile_number,
                   'profession': employee_info.profession,
                   'skills': employee_info.skills,
                   'interests': employee_info.interests,
                   'languages': employee_info.languages,
              }
              # Fetch and serialize lists
              # Ensure relationships are correctly defined in models for these to work
              profile_data['work_experiences'] = [{'id': exp.experience_id, 'title': exp.job_title, 'company': exp.company, 'location': exp.location, 'start_date': exp.start_date.isoformat(), 'end_date': exp.end_date.isoformat() if exp.end_date else None, 'description': exp.description} for exp in employee_info.work_experiences.all()] # Use .all() if lazy='dynamic'
              profile_data['projects'] = [{'id': proj.project_id, 'title': proj.title, 'description': proj.description, 'technologies': proj.technologies, 'link': proj.link} for proj in employee_info.projects.all()] # Use .all()
              profile_data['education'] = [{'id': edu.education_id, 'degree': edu.degree, 'institution': edu.institution, 'field_of_study': edu.field_of_study, 'year_of_completion': edu.year_of_completion, 'notes': edu.notes} for edu in employee_info.education.all()] # Use .all()
    elif user.user_type == UserType.employer: # Use Enum value for comparison
         # Assuming employer_info is a relationship on the User model or filter by user_id
         # You might need to import the Employer model
         # from models.employer.employers import Employer # Assuming Employer model exists
         try:
             employer_info = Employer.query.filter_by(user_id=user_id).first() # Use filter_by
             if employer_info:
                  profile_data['employer_details'] = {
                       'business_name': employer_info.business_name,
                       'business_type': employer_info.business_type,
                       # Add locations and accounts if needed
                  }
         except NameError:
             # Handle case where Employer model is not imported or defined
             current_app.logger.warning("Employer model not found when fetching employer profile data.")
             profile_data['employer_details'] = None


    # Add the status field for successful responses
    profile_data['status'] = 'success'
    profile_data['message'] = 'Profile data loaded successfully' # Optional success message

    return profile_data

# --- Service function to mark a flag in the user_flags JSON ---
def update_user_flag(user_id, flag_name, flag_value):
    """Updates a specific flag in the user_flags JSON column."""
    try:
        user = Users.query.get(user_id)
        if not user:
            return {'status': 'error', 'message': 'User not found.'}

        # Ensure user_flags is a dictionary (it should be with default={})
        if not isinstance(user.user_flags, dict):
            user.user_flags = {}

        user.user_flags[flag_name] = flag_value # Update or add the flag
        # Mark the attribute as modified for SQLAlchemy to detect changes in mutable types like JSON
        db.session.dirty_attributes.add('user_flags')
        db.session.commit()
        return {'status': 'success', 'message': f'Flag "{flag_name}" updated.', 'user_flags': user.user_flags}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating flag '{flag_name}' for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error updating flag "{flag_name}": {e}'}

# --- Modified service function to mark wizard shown using the new update_user_flag ---
def mark_wizard_shown(user_id):
    """Marks the profile wizard as shown for a user using the user_flags JSON."""
    return update_user_flag(user_id, 'wizard_shown', True)

def follow_user(current_user_id, target_user_id):
    try:
        user = Users.query.get(current_user_id)
        if not user:
            return {'status': 'error', 'message': 'Current user not found.'}
        target_user = Users.query.get(target_user_id)
        if not target_user:
            return {'status': 'error', 'message': 'Target user not found.'}
        if current_user_id == target_user_id:
            return {'status': 'error', 'message': 'Cannot follow yourself.'}
        print(Followers.query.filter_by(follower_id=current_user_id, followed_id=target_user_id).all())
        exists = Followers.query.filter_by(follower_id=current_user_id, followed_id=target_user_id).first()
        if exists:
            return unfollow_user(current_user_id, target_user_id)
        newFollower = Followers(follower_id=current_user_id, followed_id=target_user_id)
        db.session.add(newFollower)
        db.session.commit()
        return {'status':'success', 'message': 'User followed successfully.', 'following': True}
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error following user {target_user_id}: {e}")
        return {'status': 'error', 'message': f'Error following user: {e}'}

def unfollow_user(current_user_id, target_user_id):
    follow = Followers.query.filter_by(follower_id=current_user_id, followed_id=target_user_id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
        return {'status':'success', 'message': 'User unfollowed successfully.', 'following': False}
    else:
        return {'status': 'error', 'message': 'User is not currently following the target user.'}
                
def get_follows(user_id):
    try:
        follows_enteries = Followers.query.filter_by(follower_id=user_id).all()
        followed_by_enteries = Followers.query.filter_by(followed_id=user_id).all()

        followers = [following.followed_id for following in follows_enteries]
        following = [followed_by.follower_id for followed_by in followed_by_enteries]
        return {'status': 'success', 'message': 'Followers loaded successfully.', 'followers': followers, 'following': following   }
    except Exception as e:
        current_app.logger.error(f"Error fetching followers for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error fetching followers: {e}'}

def get_resume(user_id):
    try:
        resume = Resume.query.filter_by(user_id=user_id).first()
        path = resume.resume_path
        if resume and resume.resume_path:
            return resume.resume_path
        else:
            return {'status': 'error', 'message': 'Resume not found for this user.'}
    except Exception as e:
        current_app.logger.error(f"Error fetching resume for user {user_id}: {e}")
        return {'status': 'error', 'message': f'Error fetching resume: {e}'}



def upload_resume(user, file):
    """Uploads or updates a user's resume and updates the Resume table."""
    if not file or not allowed_file_pdf(file.filename):
        return {'status': 'error', 'message': 'Invalid file type or no file selected.'}

    filename = secure_filename(file.filename)

    # Build user folder and file path
    user_folder = os.path.join(UPLOAD_FOLDER, f"user_{user.user_id}")
    os.makedirs(user_folder, exist_ok=True)

    filepath = os.path.join(user_folder, f"{user.user_id}_{filename}")
    relative_path = os.path.join(UPLOAD_PATH, f"user_{user.user_id}", f"{user.user_id}_{filename}")

    try:
        # Look up existing resume
        resume = Resume.query.filter_by(user_id=user.user_id).first()

        # If exists, delete old file
        if resume and resume.resume_path and os.path.exists(resume.resume_path):
            os.remove(resume.resume_path)

        # Save new file
        file.save(filepath)

        # Update or create resume entry
        if resume:
            resume.resume_path = filepath
        else:
            resume = Resume(user_id=user.user_id, resume_path=filepath)
            db.session.add(resume)

        db.session.commit()

        return {
            'status': 'success',
            'message': 'Resume uploaded and saved successfully.',
            'resume_url': relative_path
        }

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error uploading resume for user {user.user_id}: {e}")
        return {'status': 'error', 'message': f'Failed to upload resume: {str(e)}'}