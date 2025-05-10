from database.database import db  
from models.misc.geographic import Countries, Cities
from flask import jsonify, request

def get_countries():
    countries = Countries.query.order_by(Countries.country_name).all()
    return jsonify([
        {'id': c.country_id, 'name': c.country_name}
        for c in countries
    ])


def get_cities(query=None):
    if not query:
        return jsonify([])

    # Split on commas for city, state, country fragments
    parts = [p.strip() for p in query.split(',') if p.strip()]
    city_part = parts[0]
    country_part = parts[1] if len(parts) > 1 else None

    if len(city_part) < 1:
        return jsonify([])

    # Build base query
    query = (
        db.session.query(Cities, Countries)
        .join(Countries, Cities.country_id == Countries.country_id)
        .filter(Cities.city.ilike(f'{city_part}%'))
    )

    # If user specified a country fragment, filter by that too
    if country_part:
        query = query.filter(Countries.country_name.ilike(f'%{country_part}%'))

    # Limit results
    results = query.limit(5).all()

    return jsonify([
        {
            'id': city.city_id,
            'display': f"{city.city}, {country.country_name}"
        }
        for city, country in results
    ])