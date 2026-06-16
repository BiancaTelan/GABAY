from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime
from db_connection import Base 

class GabayAuditLog(Base):
    __tablename__ = "gabay_audit_log"

    audit_id = Column(Integer, primary_key=True, autoincrement=True)
    table_name = Column(String(50))
    action_type = Column(String(10))
    record_id = Column(Integer)
    old_data = Column(JSON, nullable=True)
    new_data = Column(JSON, nullable=True)
    db_user = Column(String(50))
    changed_at = Column(DateTime, default=datetime.utcnow)