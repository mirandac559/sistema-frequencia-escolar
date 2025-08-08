from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.models.attendance import Attendance
from src.models.student import Student
from src.models.class_model import Class
from datetime import datetime, date

attendance_bp = Blueprint('attendance', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@attendance_bp.route('/statistics', methods=['GET'])
def get_statistics():
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Não autenticado'}), 401
        
        total_classes = Class.query.filter_by(is_active=True).count()
        total_students = Student.query.filter_by(is_active=True).count()
        total_teachers = User.query.filter_by(role='teacher', is_active=True).count()
        
        return jsonify({
            'totalClasses': total_classes,
            'totalStudents': total_students,
            'totalTeachers': total_teachers
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('', methods=['GET'])
def get_attendances():
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Não autenticado'}), 401
        
        class_id = request.args.get('class_id')
        date_str = request.args.get('date')
        
        query = Attendance.query
        
        if class_id:
            query = query.filter_by(class_id=class_id)
        
        if date_str:
            attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.filter_by(date=attendance_date)
        
        attendances = query.all()
        return jsonify([attendance.to_dict() for attendance in attendances]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('', methods=['POST'])
def create_attendance():
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Não autenticado'}), 401
        
        data = request.get_json()
        
        attendance_date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
        
        # Verificar se já existe registro para este estudante nesta data
        existing = Attendance.query.filter_by(
            student_id=data.get('student_id'),
            date=attendance_date
        ).first()
        
        if existing:
            return jsonify({'error': 'Frequência já registrada para este estudante nesta data'}), 400
        
        new_attendance = Attendance(
            student_id=data.get('student_id'),
            class_id=data.get('class_id'),
            date=attendance_date,
            status=data.get('status'),
            notes=data.get('notes', ''),
            recorded_by=user.id
        )
        
        db.session.add(new_attendance)
        db.session.commit()
        
        return jsonify(new_attendance.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/<int:attendance_id>', methods=['PUT'])
def update_attendance(attendance_id):
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Não autenticado'}), 401
        
        attendance = Attendance.query.get_or_404(attendance_id)
        data = request.get_json()
        
        attendance.status = data.get('status', attendance.status)
        attendance.notes = data.get('notes', attendance.notes)
        
        db.session.commit()
        
        return jsonify(attendance.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/<int:attendance_id>', methods=['DELETE'])
def delete_attendance(attendance_id):
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Não autenticado'}), 401
        
        attendance = Attendance.query.get_or_404(attendance_id)
        db.session.delete(attendance)
        db.session.commit()
        
        return jsonify({'message': 'Registro de frequência excluído com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
