import os
import subprocess
from datetime import datetime
from dotenv import load_dotenv
import cloudinary.uploader 

load_dotenv()

# ---------------------------------------------------------
#  BACKUP UTILS
# ---------------------------------------------------------
def perform_database_backup():
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASS = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "gabay_db")
    DB_PORT = os.getenv("DB_PORT", "4000") 

    MYSQLDUMP_PATH = os.getenv("MYSQLDUMP_PATH", "mysqldump") 

    backup_dir = os.path.join(os.getcwd(), "backups")
    os.makedirs(backup_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{DB_NAME}_backup_{timestamp}.sql"
    filepath = os.path.join(backup_dir, filename)

    dump_cmd = [
        MYSQLDUMP_PATH, 
        "-h", DB_HOST, 
        "-P", str(DB_PORT),
        "-u", DB_USER,
        DB_NAME
    ]
    
    env = os.environ.copy()
    if DB_PASS:
        env["MYSQL_PWD"] = DB_PASS

    try:
        with open(filepath, 'w') as out_file:
            subprocess.run(dump_cmd, stdout=out_file, env=env, check=True)
            
        upload_result = cloudinary.uploader.upload(
            filepath, 
            resource_type="raw", 
            folder="gabay_backups",
            use_filename=True,
            unique_filename=False
        )
        
        if os.path.exists(filepath):
            os.remove(filepath)
            
        return {
            "success": True, 
            "filename": filename,
            "url": upload_result.get("secure_url") 
        }
        
    except subprocess.CalledProcessError as e:
        if os.path.exists(filepath):
            os.remove(filepath) 
        return {"success": False, "error": f"Command failed: {e}"}
        
    except FileNotFoundError:
        return {"success": False, "error": f"Executable not found at path: {MYSQLDUMP_PATH}"}
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return {"success": False, "error": str(e)}