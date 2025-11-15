from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
from PIL import Image

# Xóa database cũ nếu tồn tại (chỉ khi cần reset)
# if os.path.exists('tasks.db'):
#     os.remove('tasks.db')

# Khởi tạo app và database
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['UPLOAD_FOLDER'] = 'static/avatars'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    avatar_path = db.Column(db.String(200))
    tasks = db.relationship('Task', backref='user', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    finished_at = db.Column(db.DateTime)
    estimated_hours = db.Column(db.Float, nullable=False, default=1.0)
    priority = db.Column(db.String(20), default='medium')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subtasks = db.relationship('Subtask', backref='task', lazy=True, cascade='all, delete-orphan', order_by='Subtask.id')

    @property
    def priority_color(self):
        return {
            'low': 'info',
            'medium': 'warning',
            'high': 'danger'
        }.get(self.priority, 'secondary')

    @property
    def current_status(self):
        """Trả về trạng thái hiện tại của task"""
        if self.status == 'completed':
            return 'completed'
        elif self.due_date < datetime.now() and self.status != 'completed':
            return 'overdue'
        elif self.status == 'in_progress':
            return 'in_progress'
        else:
            return 'pending'
    
    @property
    def subtasks_completed_count(self):
        """Đếm số subtasks đã hoàn thành"""
        return len([st for st in self.subtasks if st.completed])
    
    @property
    def subtasks_total_count(self):
        """Tổng số subtasks"""
        return len(self.subtasks)

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
@login_required
def index():
    # Lấy query parameters cho search và filter
    search_query = request.args.get('search', '').strip()
    status_filter = request.args.get('status', 'all')
    priority_filter = request.args.get('priority', 'all')
    sort_by = request.args.get('sort', 'due_date')
    
    # Base query
    query = Task.query.filter_by(user_id=current_user.id)
    
    # Apply search filter
    if search_query:
        query = query.filter(
            (Task.title.contains(search_query)) |
            (Task.description.contains(search_query))
        )
    
    # Apply status filter
    if status_filter != 'all':
        query = query.filter(Task.status == status_filter)
    
    # Apply priority filter
    if priority_filter != 'all':
        query = query.filter(Task.priority == priority_filter)
    
    # Apply sorting
    if sort_by == 'due_date':
        query = query.order_by(Task.due_date.asc())
    elif sort_by == 'priority':
        priority_order = {'high': 1, 'medium': 2, 'low': 3}
        query = query.order_by(Task.priority.asc())
    elif sort_by == 'created':
        query = query.order_by(Task.created_at.desc())
    elif sort_by == 'title':
        query = query.order_by(Task.title.asc())
    
    # Eager load subtasks để tránh N+1 query
    from sqlalchemy.orm import joinedload
    tasks = query.options(joinedload(Task.subtasks)).all()
    
    # Tính toán dashboard statistics
    now = datetime.now()
    all_tasks = Task.query.filter_by(user_id=current_user.id).all()
    
    total_tasks = len(all_tasks)
    pending_tasks = len([t for t in all_tasks if t.status == 'pending'])
    in_progress_tasks = len([t for t in all_tasks if t.status == 'in_progress'])
    completed_tasks = len([t for t in all_tasks if t.status == 'completed'])
    
    overdue_tasks = Task.query.filter(
        Task.user_id == current_user.id,
        Task.status != 'completed',
        Task.due_date < now
    ).all()
    
    # Phân loại tasks trễ hạn theo mức độ
    critical_overdue = [] # Trễ > 24h
    today_overdue = []   # Trễ < 24h
    
    for task in overdue_tasks:
        hours_overdue = (now - task.due_date).total_seconds() / 3600
        if hours_overdue > 24:
            critical_overdue.append(task)
        else:
            today_overdue.append(task)
    
    overdue_stats = {
        'total': len(overdue_tasks),
        'critical': len(critical_overdue),
        'today': len(today_overdue)
    }
    
    dashboard_stats = {
        'total': total_tasks,
        'pending': pending_tasks,
        'in_progress': in_progress_tasks,
        'completed': completed_tasks,
        'overdue': overdue_stats['total']
    }
    
    return render_template('index.html', 
                         tasks=tasks, 
                         overdue_stats=overdue_stats,
                         dashboard_stats=dashboard_stats,
                         critical_overdue=critical_overdue,
                         today_overdue=today_overdue,
                         now=now,
                         search_query=search_query,
                         status_filter=status_filter,
                         priority_filter=priority_filter,
                         sort_by=sort_by)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        # Validation
        if not username or len(username) < 3:
            flash('Username must be at least 3 characters long')
            return redirect(url_for('register'))
        
        if not password or len(password) < 6:
            flash('Password must be at least 6 characters long')
            return redirect(url_for('register'))
        
        if password != confirm_password:
            flash('Passwords do not match')
            return redirect(url_for('register'))
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role='user'
        )
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/upload_avatar', methods=['POST'])
@login_required
def upload_avatar():
    if 'avatar' not in request.files:
        flash('No file part')
        return redirect(url_for('index'))
    
    file = request.files['avatar']
    if file.filename == '':
        flash('No selected file')
        return redirect(url_for('index'))
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Resize image if needed
        with Image.open(filepath) as img:
            img.thumbnail((200, 200))
            img.save(filepath)
        
        current_user.avatar_path = f'avatars/{filename}'
        db.session.commit()
        flash('Avatar updated successfully')
    
    return redirect(url_for('index'))

@app.route('/add_task', methods=['POST'])
@login_required
def add_task():
    try:
        title = request.form.get('title')
        description = request.form.get('description')
        due_date = datetime.strptime(request.form.get('due_date'), '%Y-%m-%dT%H:%M')
        
        # Lấy giờ và phút từ form
        hours = int(request.form.get('hours', 0))
        minutes = int(request.form.get('minutes', 0))
        
        # Validation: Phải có ít nhất 1 phút
        if hours == 0 and minutes == 0:
            flash('Estimated time must be at least 1 minute')
            return redirect(url_for('index'))
        
        estimated_hours = hours + (minutes / 60)  # Chuyển đổi thành giờ
            
        priority = request.form.get('priority', 'medium')
        
        task = Task(
            title=title,
            description=description,
            due_date=due_date,
            created_at=datetime.now(),  # Sử dụng thời gian hiện tại
            estimated_hours=estimated_hours,
            priority=priority,
            user_id=current_user.id
        )
        db.session.add(task)
        db.session.flush()  # Flush để lấy task.id
        
        # Xử lý subtasks nếu có
        subtasks_json = request.form.get('subtasks', '[]')
        if subtasks_json and subtasks_json != '[]':
            import json
            try:
                subtasks_data = json.loads(subtasks_json)
                if isinstance(subtasks_data, list):
                    for subtask_data in subtasks_data:
                        if subtask_data.get('title', '').strip():
                            subtask = Subtask(
                                title=subtask_data['title'].strip(),
                                completed=subtask_data.get('completed', False),
                                task_id=task.id
                            )
                            db.session.add(subtask)
            except (json.JSONDecodeError, TypeError) as e:
                print(f"Error parsing subtasks JSON: {e}")
                pass  # Ignore invalid JSON
        
        db.session.commit()
        flash('Task added successfully')
    except Exception as e:
        flash(f'Error adding task: {str(e)}')
        db.session.rollback()
    
    return redirect(url_for('index'))

@app.route('/update_task_status/<int:task_id>', methods=['POST'])
@login_required
def update_task_status(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        if request.is_json:
            return jsonify({'error': 'Unauthorized'}), 403
        return redirect(url_for('index'))
    
    new_status = request.form.get('status') or (request.json.get('status') if request.is_json else None)
    task.status = new_status
    
    if new_status == 'completed':
        task.finished_at = datetime.utcnow()
        # Tự động đánh dấu tất cả subtasks là completed
        for subtask in task.subtasks:
            subtask.completed = True
    
    db.session.commit()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'status': task.status,
            'subtasks_completed': task.subtasks_completed_count,
            'subtasks_total': task.subtasks_total_count
        })
    
    flash('Task status updated')
    return redirect(url_for('index'))

@app.route('/create-test-tasks')
@login_required
def create_test_tasks():
    try:
        # Overdue task
        overdue_task = Task(
            title="Overdue Task",
            description="This task is 2 days overdue",
            due_date=datetime.utcnow() - timedelta(days=2),
            user_id=current_user.id,
            status='pending',
            estimated_hours=4.0,
            priority='high'
        )
        
        # Due today task
        due_today_task = Task(
            title="Due Today Task",
            description="This task is due today",
            due_date=datetime.utcnow(),
            user_id=current_user.id,
            status='in_progress',
            estimated_hours=2.5,
            priority='medium'
        )
        
        # Future task
        future_task = Task(
            title="Future Task",
            description="This task is due in 3 days",
            due_date=datetime.utcnow() + timedelta(days=3),
            user_id=current_user.id,
            status='pending',
            estimated_hours=1.5,
            priority='low'
        )
        
        # Completed overdue task
        completed_overdue_task = Task(
            title="Completed Overdue Task",
            description="This task was completed but was overdue",
            due_date=datetime.utcnow() - timedelta(days=1),
            user_id=current_user.id,
            status='completed',
            finished_at=datetime.utcnow(),
            estimated_hours=3.0,
            priority='medium'
        )

        db.session.add(overdue_task)
        db.session.add(due_today_task)
        db.session.add(future_task)
        db.session.add(completed_overdue_task)
        db.session.commit()
        
        flash('Test tasks created successfully!')
    except Exception as e:
        flash(f'Error creating test tasks: {str(e)}')
        db.session.rollback()
    
    return redirect(url_for('index'))

@app.route('/edit_task/<int:task_id>', methods=['GET', 'POST'])
@login_required
def edit_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        flash('Unauthorized action')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        try:
            task.title = request.form.get('title')
            task.description = request.form.get('description')
            task.due_date = datetime.strptime(request.form.get('due_date'), '%Y-%m-%dT%H:%M')
            
            hours = int(request.form.get('hours', 0))
            minutes = int(request.form.get('minutes', 0))
            
            # Validation: Phải có ít nhất 1 phút
            if hours == 0 and minutes == 0:
                flash('Estimated time must be at least 1 minute')
                return redirect(url_for('index'))
            
            task.estimated_hours = hours + (minutes / 60)
            
            task.priority = request.form.get('priority', 'medium')
            task.status = request.form.get('status', task.status)
            
            if task.status == 'completed' and not task.finished_at:
                task.finished_at = datetime.utcnow()
            elif task.status != 'completed':
                task.finished_at = None
            
            db.session.commit()
            flash('Task updated successfully')
        except Exception as e:
            flash(f'Error updating task: {str(e)}')
            db.session.rollback()
        
        return redirect(url_for('index'))
    
    # GET request - return task data as JSON for modal
    total_minutes = int(task.estimated_hours * 60)
    hours = total_minutes // 60
    minutes = total_minutes % 60
    
    subtasks_data = [{
        'id': st.id,
        'title': st.title,
        'completed': st.completed
    } for st in task.subtasks]
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description or '',
        'due_date': task.due_date.strftime('%Y-%m-%dT%H:%M'),
        'estimated_hours': hours,
        'estimated_minutes': minutes,
        'priority': task.priority,
        'status': task.status,
        'subtasks': subtasks_data
    })

@app.route('/delete_task/<int:task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        if request.is_json:
            return jsonify({'error': 'Unauthorized'}), 403
        flash('Unauthorized action')
        return redirect(url_for('index'))
    
    try:
        task_title = task.title
        db.session.delete(task)
        db.session.commit()
        
        if request.is_json:
            return jsonify({'success': True, 'message': f'Task "{task_title}" deleted successfully'})
        
        flash('Task deleted successfully')
    except Exception as e:
        if request.is_json:
            return jsonify({'error': str(e)}), 500
        flash(f'Error deleting task: {str(e)}')
        db.session.rollback()
    
    return redirect(url_for('index'))

# Subtask routes
@app.route('/add_subtask/<int:task_id>', methods=['POST'])
@login_required
def add_subtask(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        title = request.json.get('title', '').strip()
        if not title:
            return jsonify({'error': 'Subtask title is required'}), 400
        
        subtask = Subtask(
            title=title,
            task_id=task_id
        )
        db.session.add(subtask)
        db.session.commit()
        
        return jsonify({
            'id': subtask.id,
            'title': subtask.title,
            'completed': subtask.completed
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/toggle_subtask/<int:subtask_id>', methods=['POST'])
@login_required
def toggle_subtask(subtask_id):
    subtask = Subtask.query.get_or_404(subtask_id)
    task = subtask.task
    
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        subtask.completed = not subtask.completed
        db.session.commit()
        
        return jsonify({
            'id': subtask.id,
            'completed': subtask.completed,
            'completed_count': task.subtasks_completed_count,
            'total_count': task.subtasks_total_count
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/delete_subtask/<int:subtask_id>', methods=['POST'])
@login_required
def delete_subtask(subtask_id):
    subtask = Subtask.query.get_or_404(subtask_id)
    task = subtask.task
    
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        db.session.delete(subtask)
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Tạo tất cả bảng trong database
with app.app_context():
    db.create_all()
    # Đảm bảo tất cả bảng đã được tạo, bao gồm Subtask
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Database tables: {tables}")
    if 'subtask' not in tables:
        print("WARNING: Subtask table not found! Recreating database...")
        db.drop_all()
        db.create_all()

if __name__ == '__main__':
    app.run(debug=True) 