"""
Script to drop all tables and recreate them with the updated schema
"""
from sqlalchemy import create_engine, text
from config import settings

def recreate_database():
    engine = create_engine(settings.database_url)

    print("Dropping all tables...")
    with engine.begin() as conn:
        # Drop all tables in correct order (respect foreign keys)
        conn.execute(text("DROP TABLE IF EXISTS task_tags CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS tags CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS messages CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS conversations CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))

    print("All tables dropped successfully!")
    print("Please restart the backend server to recreate tables with the updated schema.")

if __name__ == "__main__":
    recreate_database()
