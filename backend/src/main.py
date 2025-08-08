import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request, redirect
from flask_cors import CORS
from src.models.user import db
from src.models.school import School
from src.models.class_model import Class
from src.models.student import Student
from src.models.attendance import Attendance
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.classes import classes_bp
from src.routes.students import students_bp
from src.routes.attendance import attendance_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurar CORS para permitir requisições do frontend
CORS(app, origins=[
    'https://*.manus.space',
    'https://e5h6i7cdvwll.manus.space',
    'http://localhost:*', 
    'http://127.0.0.1:*'
], supports_credentials=True)

# Forçar HTTPS em produção
@app.before_request
def force_https():
    if request.headers.get('X-Forwarded-Proto') == 'http':
        return redirect(request.url.replace('http://', 'https://'), code=301)

# Adicionar headers de segurança
@app.after_request
def after_request(response):
    # Headers de segurança
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "upgrade-insecure-requests"
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Headers CORS adicionais
    origin = request.headers.get('Origin')
    if origin and ('manus.space' in origin or 'localhost' in origin or '127.0.0.1' in origin):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    return response

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(classes_bp, url_prefix='/api/classes')
app.register_blueprint(students_bp, url_prefix='/api/students')
app.register_blueprint(attendance_bp, url_prefix='/api/attendance')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    
    # Criar usuário administrador padrão se não existir
    from src.models.user import User
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
    
    # Criar usuário professor padrão se não existir
    professor = User.query.filter_by(username='professor').first()
    if not professor:
        professor = User(username='professor', role='teacher')
        professor.set_password('prof123')
        db.session.add(professor)
    
    # Criar escola padrão se não existir
    school = School.query.first()
    if not school:
        school = School(
            name='Escola Exemplo',
            address='Rua das Flores, 123',
            phone='(11) 1234-5678',
            email='contato@escolaexemplo.com.br'
        )
        db.session.add(school)
    
    # Criar turma padrão se não existir
    default_class = Class.query.first()
    if not default_class:
        default_class = Class(
            name='Turma A',
            grade='5º Ano',
            year=2024,
            teacher='Professor Exemplo',
            description='Turma do 5º ano do ensino fundamental',
            school_id=1
        )
        db.session.add(default_class)
    
    db.session.commit()

# Servir arquivos estáticos do frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
