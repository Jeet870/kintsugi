from app.db.session import engine
from sqlalchemy import text

def fix_table():
    with engine.connect() as conn:
        cols = [r[0] for r in conn.execute(text("DESCRIBE mood_streaks")).fetchall()]
        print("Current columns in mood_streaks:", cols)
        
        if "created_at" not in cols:
            print("Adding created_at column...")
            conn.execute(text("ALTER TABLE mood_streaks ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            conn.commit()
            print("Added created_at.")
            
        if "updated_at" not in cols:
            print("Adding updated_at column...")
            conn.execute(text("ALTER TABLE mood_streaks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
            conn.commit()
            print("Added updated_at.")

if __name__ == "__main__":
    fix_table()
