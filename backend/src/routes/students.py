from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.models.student import Student
from datetime import datetime

students_bp = Blueprint('students', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@students_bp.route('', methods=['GET'])
def get_students():
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Não autenticado'}), 401
        
        students = Student.query.filter_by(is_active=True).all()
        return jsonify([student.to_dict() for student in students]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('', methods=['POST'])
def create_student():
    try:
        user = require_auth()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        # Verificar se o student_id já existe
        existing_student = Student.query.filter_by(student_id=data.get('student_id')).first()
        if existing_student:
            return jsonify({'error': 'ID do estudante já existe'}), 400
        
        birth_date = None
        if data.get('birth_date'):
            birth_date = datetime.strptime(data.get('birth_date'), '%Y-%m-%d').date()
        
        new_student = Student(
            student_id=data.get('student_id'),
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            birth_date=birth_date,
            parent_name=data.get('parent_name'),
            parent_phone=data.get('parent_phone'),
            class_id=int(data.get('class_id'))
        )
        
        db.session.add(new_student)
        db.session.commit()
        
        return jsonify(new_student.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        user = require_auth()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Acesso negado'}), 403
        
        student = Student.query.get_or_404(student_id)
        data = request.get_json()
        
        student.name = data.get('name', student.name)
        student.email = data.get('email', student.email)
        student.phone = data.get('phone', student.phone)
        student.address = data.get('address', student.address)
        student.parent_name = data.get('parent_name', student.parent_name)
        student.parent_phone = data.get('parent_phone', student.parent_phone)
        student.class_id = int(data.get('class_id', student.class_id))
        
        if data.get('birth_date'):
            student.birth_date = datetime.strptime(data.get('birth_date'), '%Y-%m-%d').date()
        
        db.session.commit()
        
        return jsonify(student.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        user = require_auth()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Acesso negado'}), 403
        
        student = Student.query.get_or_404(student_id)
        student.is_active = False  # Soft delete
        
        db.session.commit()
        
        return jsonify({'message': 'Estudante excluído com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
