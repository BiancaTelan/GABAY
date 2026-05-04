import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def perform_database_backup():
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASS = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "gabay_db")

    MYSQLDUMP_PATH = os.getenv("MYSQLDUMP_PATH", "mysqldump") 

    backup_dir = os.path.join(os.getcwd(), "backups")
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{DB_NAME}_backup_{timestamp}.sql"
    filepath = os.path.join(backup_dir, filename)

    dump_cmd = [MYSQLDUMP_PATH, "-h", DB_HOST, "-u", DB_USER]
    if DB_PASS:
        dump_cmd.extend([f"-p{DB_PASS}"])
    dump_cmd.append(DB_NAME)

    try:
        with open(filepath, 'w') as out_file:
            subprocess.run(dump_cmd, stdout=out_file, check=True)
            
        return {"success": True, "filepath": filepath, "filename": filename}
        
    except subprocess.CalledProcessError as e:
        if os.path.exists(filepath):
            os.remove(filepath) 
        return {"success": False, "error": f"Database command failed: {e}"}
        
    except FileNotFoundError:
        return {"success": False, "error": f"Executable not found at path: {MYSQLDUMP_PATH}. Check your .env file."}
    except Exception as e:
        return {"success": False, "error": str(e)}