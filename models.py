from sqlalchemy import Column, Integer, String
from database import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    igdb_id = Column(Integer, unique=True, index=True)
    title = Column(String, index=True)
    cover_url = Column(String)
    release_date = Column(String)
    platforms = Column(String)