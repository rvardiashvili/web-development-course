import os

# Define the absolute path to the uploads folder
# Assumes config.py is in a directory that is a sibling to the 'frontend' directory
# Adjust '../frontend/static/uploads' if your directory structure is different
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Directory where config.py is located
UPLOAD_FOLDER = os.path.join(BASE_DIR, '..', 'frontend', 'static', 'uploads')

# Define the URL path from which these files will be served by the web server
# This should correspond to the UPLOAD_FOLDER relative to your static file root
UPLOAD_PATH = "/static/uploads"

# Allowed file extensions for uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure the upload folder exists when the app starts (optional, but good practice)
# You might do this in your app factory or startup script as well
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Add other configuration variables below this line
# SECRET_KEY = 'your_secret_key_here'
# SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
# ... etc.
