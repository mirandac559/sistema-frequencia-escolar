from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.models.class_model import Class

classes_bp = Blueprint('classes', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

@classes_bp.route('', methods=['GET'])
def get_classes():
    try:
        user = require_auth()
        if not user:
            return jsonify({'error': 'Não autenticado'}), 401
        
        classes = Class.query.filter_by(is_active=True).all()
        return jsonify([cls.to_dict() for cls in classes]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@classes_bp.route('', methods=['POST'])
def create_class():
    try:
        user = require_auth()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        new_class = Class(
            name=data.get('name'),
            grade=data.get('grade'),
            year=int(data.get('year', 2024)),
            teacher=data.get('teacher'),
            description=data.get('description', ''),
            school_id=1  # Assumindo escola padrão
        )
        
        db.session.add(new_class)
        db.session.commit()
        
        return jsonify(new_class.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@classes_bp.route('/<int:class_id>', methods=['PUT'])
def update_class(class_id):
    try:
        user = require_auth()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Acesso negado'}), 403
        
        cls = Class.query.get_or_404(class_id)
        data = request.get_json()
        
        cls.name = data.get('name', cls.name)
        cls.grade = data.get('grade', cls.grade)
        cls.year = int(data.get('year', cls.year))
        cls.teacher = data.get('teacher', cls.teacher)
        cls.description = data.get('description', cls.description)
        
        db.session.commit()
        
        return jsonify(cls.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@classes_bp.route('/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    try:
        user = require_auth()
        if not user or user.role != 'admin':
            return jsonify({'error': 'Acesso negado'}), 403
        
        cls = Class.query.get_or_404(class_id)
        cls.is_active = False  # Soft delete
        
        db.session.commit()
        
        return jsonify({'message': 'Turma excluída com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
