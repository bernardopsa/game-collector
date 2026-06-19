from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import httpx
import os
import re
from dotenv import load_dotenv
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import time
from bs4 import BeautifulSoup
import urllib.parse
import cloudscraper
import unicodedata
import google.generativeai as genai
import json

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

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

    db_game = db.query(models.Game).filter(
        models.Game.igdb_id == game.igdb_id,
        models.Game.media_platform == game.media_platform,
        models.Game.edition == game.edition
    ).first()
    
    if db_game:
        raise HTTPException(status_code=400, detail="Esta edição/plataforma já está cadastrada.")
    
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

@app.get("/api/home")
def get_home_data():
    try:
        token = get_token_twitch()
        url_igdb = "https://api.igdb.com/v4/games"
        headers = {
            "Client-ID": CLIENT_ID,
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }
        
        now = int(time.time())
        three_months_ago = now - (90 * 24 * 60 * 60)
        physical_platforms = "(48, 167, 130, 49, 169)"
        
        # Adicionado 'slug' no fields
        query_recent = f"""
            fields id, name, slug, cover.url, first_release_date, platforms.name; 
            where game_type = 0 & platforms = {physical_platforms} 
            & first_release_date >= {three_months_ago} & first_release_date <= {now}; 
            sort total_rating_count desc; 
            limit 10;
        """
        
        query_upcoming = f"""
            fields id, name, slug, cover.url, first_release_date, platforms.name; 
            where game_type = 0 & platforms = {physical_platforms} 
            & first_release_date > {now}; 
            sort hypes desc; 
            limit 10;
        """
        
        res_recent = httpx.post(url_igdb, headers=headers, content=query_recent)
        res_upcoming = httpx.post(url_igdb, headers=headers, content=query_upcoming)
        
        # Função interna rápida para mapear os dados incluindo o slug
        def map_game(jogo):
            return {
                "id": jogo.get("id"),
                "name": jogo.get("name"),
                "slug": jogo.get("slug"),
                "cover_url": jogo.get("cover", {}).get("url", "").replace("t_thumb", "t_cover_big") if jogo.get("cover") else None,
                "release_date": time.strftime('%Y-%m-%d', time.gmtime(jogo["first_release_date"])) if jogo.get("first_release_date") else None,
                "platforms": [p["name"] for p in jogo.get("platforms", [])]
            }

        return {
            "recentes": [map_game(j) for j in res_recent.json()] if res_recent.status_code == 200 else [],
            "prevendas": [map_game(j) for j in res_upcoming.json()] if res_upcoming.status_code == 200 else []
        }
    except Exception as e:
        return {"recentes": [], "prevendas": []}
    
@app.get("/api/games/slug/{slug}")
def get_game_by_slug(slug: str):
    try:
        token = get_token_twitch()
        url_igdb = "https://api.igdb.com/v4/games"
        headers = {
            "Client-ID": CLIENT_ID,
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }
        
        # Buscando campos extras: screenshots para o poster de fundo, videos para o trailer e involved_companies para a desenvolvedora
        body = f"""
            fields name, slug, cover.url, first_release_date, platforms.name, 
            screenshots.url, videos.video_id, involved_companies.developer, involved_companies.company.name; 
            where slug = "{slug}";
        """
        response = httpx.post(url_igdb, headers=headers, content=body)
        response.raise_for_status()
        
        data = response.json()
        if not data:
            raise HTTPException(status_code=404, detail="Jogo não encontrado")
            
        jogo = data[0]
        
        # Extrair a Desenvolvedora principal
        developer = "Não informada"
        if "involved_companies" in jogo:
            for comp in jogo["involved_companies"]:
                if comp.get("developer") is True:
                    developer = comp["company"]["name"]
                    break
        
        # Extrair o primeiro Screenshot para o Poster de Fundo
        backdrop_url = None
        if "screenshots" in jogo and len(jogo["screenshots"]) > 0:
            backdrop_url = jogo["screenshots"][0]["url"].replace("t_thumb", "t_1080p")
            
        # Extrair o ID do vídeo do YouTube para o Trailer
        video_id = None
        if "videos" in jogo and len(jogo["videos"]) > 0:
            video_id = jogo["videos"][0]["video_id"]

        return {
            "id": jogo.get("id"),
            "name": jogo.get("name"),
            "slug": jogo.get("slug"),
            "developer": developer,
            "backdrop_url": backdrop_url,
            "video_id": video_id,
            "cover_url": jogo.get("cover", {}).get("url", "").replace("t_thumb", "t_cover_big") if jogo.get("cover") else None,
            "release_date": time.strftime('%Y-%m-%d', time.gmtime(jogo["first_release_date"])) if jogo.get("first_release_date") else None,
            "platforms": [p["name"] for p in jogo.get("platforms", [])]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)])

@app.get("/api/scrape/mercadolivre")
def scrape_mercadolivre(game_name: str, platform: str):
    try:
        base_name = game_name.split(":")[0].strip()
        
        platform_map = {
            "PlayStation 5": {"search": "PS5", "block": ["ps4", "ps3", "xbox", "switch", "pc"]},
            "PlayStation 4": {"search": "PS4", "block": ["ps5", "ps3", "xbox", "switch", "pc"]},
            "PlayStation 3": {"search": "PS3", "block": ["ps5", "ps4", "xbox", "switch", "pc"]},
            "Xbox Series X|S": {"search": "Xbox Series", "block": ["ps5", "ps4", "ps3", "360", "switch", "pc"]},
            "Xbox One": {"search": "Xbox One", "block": ["ps5", "ps4", "ps3", "360", "switch", "pc"]},
            "Nintendo Switch": {"search": "Switch", "block": ["ps5", "ps4", "ps3", "xbox", "pc"]}
        }
        
        plat_info = platform_map.get(platform, {"search": platform, "block": []})
        mapped_platform = plat_info["search"]
        wrong_platforms = plat_info["block"]
        
        search_term = f"{base_name} {mapped_platform} fisico"
        query = urllib.parse.quote(search_term.replace(" ", "-"))
        url = f"https://lista.mercadolivre.com.br/{query}"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Referer": "https://www.google.com/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
        
        response = httpx.get(url, headers=headers, timeout=15.0, follow_redirects=True)
        if response.status_code != 200:
            return []
            
        soup = BeautifulSoup(response.text, 'lxml')
        valid_results = []
        
        items = soup.find_all('li', class_=lambda c: c and 'ui-search-layout__item' in c)
        if not items:
            items = soup.find_all('div', class_=lambda c: c and 'ui-search-result__wrapper' in c)

        base_name_clean = remove_accents(base_name.lower())
        keywords = base_name_clean.split()
        
        trash_words = [
            "digital", "conta", "offline", "secundaria", "primaria", "primária", "secundária",
            "codigo", "código", "25 digitos", "aluguel", "vaga", "compartilhada", "key",
            "poster", "quadro", "adesivo", "brinde", "pdf", "caneca", "camisa", "placa", "moldura", "estatua", "chaveiro"
        ]

        for item in items[:25]:
            title_el = item.find(['h2', 'h3'], class_=lambda c: c and 'title' in c)
            price_el = item.find('span', class_=lambda c: c and 'fraction' in c)
            link_el = item.find('a', href=True)
            img_el = item.find('img')
            
            if title_el and price_el and link_el:
                title_text = title_el.text.strip()
                title_lower = remove_accents(title_text.lower())
                
                # REQUISITO 1: Título do Jogo
                if not all(kw in title_lower for kw in keywords):
                    continue
                    
                # REQUISITO 2: Palavras Proibidas
                if any(trash in title_lower for trash in trash_words):
                    continue
                    
                # REQUISITO 3: Plataforma Correta
                if any(wrong_plat in title_lower for wrong_plat in wrong_platforms):
                    continue
                        
                # REQUISITO 4: Anti-Sequência Avançado
                titulo_sem_console = re.sub(r'playstation \d|ps\d|xbox|nintendo|switch', '', title_lower)
                titulo_formatado = f" {titulo_sem_console.replace(':', ' ')} "
                nome_base_formatado = f" {base_name_clean} "
                
                numeracoes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "ii", "iii", "iv", "v", "vi"]
                eh_sequencia = False
                
                for num in numeracoes:
                    palavra_num = f" {num} "
                    if palavra_num in titulo_formatado and palavra_num not in nome_base_formatado:
                        eh_sequencia = True
                        break
                        
                if eh_sequencia:
                    continue
                    
                # Extrair preço para ordenação
                price_str = price_el.text.strip()
                try:
                    numeric_price = int(price_str.replace(".", ""))
                except:
                    numeric_price = 0
                
                valid_results.append({
                    "title": title_text,
                    "price": price_str,
                    "numeric_price": numeric_price,
                    "link": link_el['href'],
                    "image": img_el.get('data-src') or img_el.get('src') if img_el else None,
                    "store": "Mercado Livre"
                })
                
        valid_results.sort(key=lambda x: x["numeric_price"])
        
        final_results = []
        for res in valid_results[:15]:
            res.pop("numeric_price")
            final_results.append(res)
                
        print(f"Scraper Local Seguro | Buscando: {search_term} | Encontrados: {len(final_results)} validados")
        return final_results

    except Exception as e:
        print(f"Erro no scraping local: {e}")
        return []