import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("IGDB_CLIENT_ID")
CLIENT_SECRET = os.getenv("IGDB_CLIENT_SECRET")

def get_token_twitch():
    url = f"https://id.twitch.tv/oauth2/token"
    params = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials"
    }

    response = httpx.post(url, params=params)
    response.raise_for_status()
    return response.json().get("access_token")

def search_game(nome: str):
    token = get_token_twitch()

    url_igdb = "https://api.igdb.com/v4/games"
    headers = {
        "Client-ID": CLIENT_ID,
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }

    query = f"""
        search "{nome};
        field name, cover.url, platforms.name, first_release_date, game_type;
        where game_type = 0;
        limit 5;
    """

    response = httpx.post(url_igdb, headers=headers, data=query)
    response.raise_for_status()

    return response.json()

if __name__ == "__main__":

    print("Iniciando teste ETL com IGDB...\n")
    results = search_game("Death Stranding")

    print(json.dumps(results, indent=2))