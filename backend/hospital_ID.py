from datetime import datetime
from db_model import User, db

def hopital_id_generation ():
    """
    Hospital ID Format: YY-XXXXXX
    Example: 26-000001
    """
    current_year = datetime.now().year
    prefix = f"{current_year % 100}"

    # Fetch the latest user with hospital ID
    latest_user = User.query.filter(User.hospital_no.like(f"{prefix}-%")).order_by(User.user_ID.desc()).first()

    if latest_user:
        last_sequence = latest_user.hospital_no.split('-')[-1]
        new_sequence = int(last_sequence) + 1
    else:
        new_sequence = 1
    
    new_hospital_no = f"{prefix}-{new_sequence:06d}"

    return new_hospital_no