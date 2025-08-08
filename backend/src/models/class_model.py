from src.models.user import db
from datetime import datetime

class Class(db.Model):
    __tablename__ = 'classes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    teacher = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    school_id = db.Column(db.Integer, db.ForeignKey('schools.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relacionamentos
    students = db.relationship('Student', backref='class_ref', lazy=True)
    attendances = db.relationship('Attendance', backref='class_ref', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'grade': self.grade,
            'year': self.year,
            'teacher': self.teacher,
            'description': self.description,
            'school_id': self.school_id,
            'student_count': len(self.students),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }
    
    def __repr__(self):
        return f'<Class {self.name}>'
