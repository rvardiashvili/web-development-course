import csv
import mysql.connector

# Connect to MySQL
conn = mysql.connector.connect(
    host='localhost',
    user='app',
    password='pass',
    database='kai'
)
cursor = conn.cursor()

# Store countries we've inserted to avoid duplicates
country_name_to_id = {}

# Open CSV
with open('worldcities.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile, delimiter=';')

    for row in reader:
        if len(row) < 12:
            continue  # Skip malformed rows

        city = row[1].strip()
        state = row[10].strip()
        country = row[7].strip()

        if not country:
            continue

        # Insert country if not already done
        if country not in country_name_to_id:
            try:
                cursor.execute("INSERT INTO Countries (country_name) VALUES (%s)", (country,))
                conn.commit()
                country_id = cursor.lastrowid
                country_name_to_id[country] = country_id
            except mysql.connector.IntegrityError:
                cursor.execute("SELECT country_id FROM Countries WHERE country_name = %s", (country,))
                country_id = cursor.fetchone()[0]
                country_name_to_id[country] = country_id
        else:
            country_id = country_name_to_id[country]

        # Insert city
        cursor.execute(
            "INSERT INTO Cities (city, state, country_id) VALUES (%s, %s, %s)",
            (city, state, country_id)
        )

conn.commit()
cursor.close()
conn.close()
