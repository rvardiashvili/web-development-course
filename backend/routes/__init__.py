from routes.auth_routes.auth_routes import auth_bp

from routes.pages.auth_pages import auth_page_bp
from routes.pages.feed import feed_bp
from routes.pages.home import home_bp
from routes.pages.profile import profile_bp
from routes.misc.geographic_routes import geographic_bp
from routes.misc.search_routes import search_bp
from routes.misc.profile_routes import profile_api_bp

def init_app(app):
    app.register_blueprint(auth_bp)

    app.register_blueprint(auth_page_bp)
    app.register_blueprint(feed_bp)
    app.register_blueprint(home_bp)
    app.register_blueprint(profile_bp)

    app.register_blueprint(geographic_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(profile_api_bp)