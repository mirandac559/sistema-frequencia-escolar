from flask import Blueprint, request, jsonify, session
from src.models.user import User, db

user_bp = Blueprint('users', __name__)

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)

def require_admin():
    user = require_auth()
    if not user or user.role != 'admin':
        return None
    return user

@user_bp.route('', methods=['GET'])
def get_users():
    try:
        user = require_admin()
        if not user:
            return jsonify({'error': 'Acesso negado'}), 403
        
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('', methods=['POST'])
def create_user():
    try:
        user = require_admin()
        if not user:
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        
        # Verificar se o username já existe
        existing_user = User.query.filter_by(username=data.get('username')).first()
        if existing_user:
            return jsonify({'error': 'Username já existe'}), 400
        
        new_user = User(
            username=data.get('username'),
            role=data.get('role', 'teacher'),
            email=data.get('email'),
            full_name=data.get('full_name')
        )
        new_user.set_password(data.get('password'))
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify(new_user.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        current_user = require_admin()
        if not current_user:
            return jsonify({'error': 'Acesso negado'}), 403
        
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        user.username = data.get('username', user.username)
        user.role = data.get('role', user.role)
        user.email = data.get('email', user.email)
        user.full_name = data.get('full_name', user.full_name)
        user.is_active = data.get('is_active', user.is_active)
        
        if data.get('password'):
            user.set_password(data.get('password'))
        
        db.session.commit()
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        current_user = require_admin()
        if not current_user:
            return jsonify({'error': 'Acesso negado'}), 403
        
        if current_user.id == user_id:
            return jsonify({'error': 'Não é possível excluir seu próprio usuário'}), 400
        
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Usuário excluído com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
