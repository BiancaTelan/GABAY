from sqlalchemy.orm import Session
from audit_tableModel import GabayAuditLog 

def log_audit_trail(db: Session, table_name: str, action_type: str, record_id: int, old_data: dict, new_data: dict, active_user_id: str):
    audit_entry = GabayAuditLog(
        table_name=table_name,
        action_type=action_type,
        record_id=record_id,
        old_data=old_data,
        new_data=new_data,
        db_user=str(active_user_id)
    )
    db.add(audit_entry)