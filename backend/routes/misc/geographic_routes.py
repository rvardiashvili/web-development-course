from flask import Blueprint, request, render_template
from services import geographic_services
geographic_bp = Blueprint('geographic', __name__, url_prefix='/geographic')

@geographic_bp.route('/countries', methods=['GET'])
def handle_countries():
    print("recieved ")
    return geographic_services.get_countries()

@geographic_bp.route('/cities', methods=['GET'])
def handle_cities():
    query = request.args.get('q', '').strip().lower()
    return geographic_services.get_cities(query)
