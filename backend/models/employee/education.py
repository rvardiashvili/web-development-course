from database.database import db


class Education(db.Model):
    __tablename__ = 'Education'
    education_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Employees.user_id'), nullable=False) # Link to Employee user_id
    degree = db.Column(db.String(255), nullable=False)
    institution = db.Column(db.String(255), nullable=False)
    field_of_study = db.Column(db.String(255))
    year_of_completion = db.Column(db.String(20))
    notes = db.Column(db.Text)
