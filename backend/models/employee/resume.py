from database.database import db

class Resume(db.Model):
    __tablename__ = 'Resume'
    resume_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Employees.user_id'), nullable=False) 
    resume_path = db.Column(db.String(255), nullable=False)
