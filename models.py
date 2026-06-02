from sqlalchemy import Column, Integer, String
from database import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    igdb_id = Column(Integer, unique=True, index=True)
    title = Column(String, index=True)
    cover_url = Column(String, nullable=True)
    release_date = Column(String, nullable=True)
    platforms = Column(String, nullable=True)
    
    collection_type = Column(String, default="estante")
    media_platform = Column(String, nullable=True)
    edition = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    min_price = Column(String, nullable=True)
    max_price = Column(String, nullable=True)