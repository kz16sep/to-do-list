"""
Script để migrate database và thêm bảng Subtask nếu chưa có
Chạy script này một lần để đảm bảo database có đầy đủ bảng
"""
from app import app, db
from sqlalchemy import inspect

with app.app_context():
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    
    print(f"Current tables: {tables}")
    
    if 'subtask' not in tables:
        print("Subtask table not found. Creating all tables...")
        db.create_all()
        print("Database migrated successfully!")
        print(f"New tables: {inspector.get_table_names()}")
    else:
        print("Subtask table already exists. No migration needed.")

