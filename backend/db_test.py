from sqlalchemy import text
from db_connection import engine 

def test_connection():
    try:
        # Attempt to establish a connection using the engine
        with engine.connect() as connection:
            # Run a simple, harmless SQL query
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()
            
            print("\n✅ SUCCESS: Connected to the GABAY database!")
            print(f"🐬 MySQL Version: {version[0]}\n")
            
    except Exception as e:
        print("\n❌ ERROR: Could not connect to the database.")
        print(f"Details: {e}\n")

if __name__ == "__main__":
    test_connection()