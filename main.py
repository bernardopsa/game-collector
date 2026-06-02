from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import httpx
import os
from dotenv import load_dotenv
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

CLIENT_ID = os.getenv("IGDB_CLIENT_ID")
CLIENT_SECRET = os.getenv("IGDB_CLIENT_SECRET")

app = FastAPI(title="Game Collector API", version="1.0")
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GameResponse(BaseModel):
    id: int
    name: str
    cover_url: Optional[str] = None
    release_date: Optional[str] = None
    platforms: List[str] = []

    @classmethod
    def from_igdb(cls, data: dict):
        cover = None
        if "cover" in data and "url" in data["cover"]:
            cover = "https:" + data["cover"]["url"].replace("t_thumb", "t_cover_big")
        
        release = None
        if "first_release_date" in data:
            release = datetime.fromtimestamp(data["first_release_date"]).strftime("%Y-%m-%d")
            
        plats = [p["name"] for p in data.get("platforms", [])]

        return cls(
            id=data["id"],
            name=data["name"],
            cover_url=cover,
            release_date=release,
            platforms=plats
        )

class GameCreate(BaseModel):
    igdb_id: int
    name: str
    cover_url: Optional[str] = None
    release_date: Optional[str] = None
    platforms: List[str] = []
    collection_type: str
    media_platform: str
    edition: str
    condition: Optional[str] = None
    min_price: Optional[str] = None
    max_price: Optional[str] = None

    @classmethod
    def from_igdb(cls, data: dict):

        cover = None
        if "cover" in data and "url" in data["cover"]:
            cover = "https:" + data["cover"]["url"].replace("t_thumb", "t_cover_big")
        
        release = None
        if "first_release_date" in data:
            release = datetime.fromtimestamp(data["first_release_date"]).strftime("%Y-%m-%d")
            
        plats = [p["name"] for p in data.get("platforms", [])]

        return cls(
            id=data["id"],
            name=data["name"],
            cover_url=cover,
            release_date=release,
            platforms=plats
        )

def get_token_twitch():
    url = "https://id.twitch.tv/oauth2/token"
    params = {"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET, "grant_type": "client_credentials"}
    res = httpx.post(url, params=params)
    res.raise_for_status()
    return res.json().get("access_token")

@app.get("/api/games/search", response_model=List[GameResponse])
def search_games(query: str):
    try:
        token = get_token_twitch()
        url_igdb = "https://api.igdb.com/v4/games"
        headers = {
            "Client-ID": CLIENT_ID,
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }
        
        body = f'search "{query}"; fields id, name, cover.url, first_release_date, platforms.name; where game_type = 0 & version_parent = null & parent_game = null; limit 20;'
        
        response = httpx.post(url_igdb, headers=headers, content=body)
        response.raise_for_status()
        
        data = response.json()

        clean_game_data = [GameResponse.from_igdb(jogo) for jogo in data]
        
        return clean_game_data

    except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
@app.post("/api/games")
def save_game(game: GameCreate, db: Session = Depends(get_db)):
    db_game = db.query(models.Game).filter(models.Game.igdb_id == game.igdb_id).first()
    if db_game:
        raise HTTPException(status_code=400, detail="Este jogo já está no seu catálogo.")
    
    plataformas_str = ",".join(game.platforms) if game.platforms else ""
    
    new_game = models.Game(
        igdb_id=game.igdb_id,
        title=game.name,
        cover_url=game.cover_url,
        release_date=game.release_date,
        platforms=plataformas_str,
        collection_type=game.collection_type,
        media_platform=game.media_platform,
        edition=game.edition,
        condition=game.condition,
        min_price=game.min_price,
        max_price=game.max_price
    )
    
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    
    return {"message": "Jogo guardado com sucesso!", "game_id": new_game.id}

@app.get("/api/games")
def get_my_games(db: Session = Depends(get_db)):
    games = db.query(models.Game).all()
    return games

@app.delete("/api/games/{game_id}")
def remove_game(game_id: int, db: Session = Depends(get_db)):
    db_game = db.query(models.Game).filter(models.Game.id == game_id).first()
    
    if not db_game:
        raise HTTPException(status_code=404, detail="Jogo não encontrado.")
    
    db.delete(db_game)
    db.commit()
    
    return {"message": "Jogo removido da coleção com sucesso!"}

@app.get("/api/games/{game_id}/editions")
def get_game_editions(game_id: int):
    try:
        token = get_token_twitch()
        url_igdb = "https://api.igdb.com/v4/games"
        headers = {
            "Client-ID": CLIENT_ID,
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }
        
        body = f'fields id, name; where version_parent = {game_id} | parent_game = {game_id}; limit 50;'
        response = httpx.post(url_igdb, headers=headers, content=body)
        response.raise_for_status()
        
        return response.json()
    except Exception:
        return []