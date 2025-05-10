from database.database import db


class Project(db.Model):
    __tablename__ = 'Projects'
    project_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Employees.user_id'), nullable=False) # Link to Employee user_id
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    technologies = db.Column(db.Text)
    link = db.Column(db.String(255))