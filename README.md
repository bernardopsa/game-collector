# GameCollector

Um Hub moderno e rastreador de preços construído para colecionadores de videojogos. O GameCollector cruza dados da maior base de dados de jogos do mundo (IGDB) com motores de busca em tempo real para encontrar as melhores ofertas de mídias físicas disponíveis no mercado, unindo organização de acervo com inteligência financeira.

## 💻 Sobre o Projeto

O objetivo do GameCollector é resolver um problema comum para colecionadores de mídias físicas: a dificuldade de encontrar o jogo exato, para a plataforma correta, sem cair em anúncios falsos de contas digitais ou produtos derivados. Através de uma interface de alta fidelidade e um back-end robusto, a aplicação não apenas exibe catálogos, trailers e informações de lançamentos, mas atua como um inspetor autônomo de e-commerce.

## 🚀 O Que Já Foi Construído

A arquitetura atual já conta com um ecossistema funcional entre o Front-end e o Back-end:

* **Integração com IGDB (Twitch):** Consumo da API oficial para popular a vitrine da plataforma com os lançamentos mais recentes, jogos em pré-venda e metadados detalhados (capas de alta resolução, desenvolvedoras, datas de lançamento e plataformas suportadas).
* **Roteamento Dinâmico Avançado:** Implementação de URLs amigáveis (Slugs) no Next.js para melhorar o SEO e a usabilidade (ex: `/jogos/god-of-war-ragnarok`).
* **Interface Premium (UI/UX):** Telas de detalhes do jogo imersivas, apresentando pôsteres panorâmicos com gradientes dinâmicos, trailers integrados e separação clara entre informações estáticas e opções de mercado.
* **Motor de Web Scraping Blindado:** Algoritmo Python construído sob medida para varrer o Mercado Livre em tempo real.
* **Engenharia de Dados:**
  * **Filtro "Anti-Lixo":** Bloqueio estrito de contas digitais, aluguéis, pôsteres, camisetas, controles e outros brindes.
  * **Filtro "Anti-Sequência":** Prevenção de falsos positivos (ex: buscar "Lego Batman: Legacy of the Dark Knight" e ocultar "Lego Batman 3").
  * **Normalização de Strings:** Tratamento automático de caracteres especiais e acentuação (resolvendo divergências como "Ragnarök" vs "Ragnarok") para garantir o match perfeito do anúncio.
  * **Ordenação Exata:** Conversão e estruturação matemática de strings de preço para exibir as listagens da mais barata para a mais cara.

## 🛠️ Tecnologias Utilizadas

* **Front-end:** Next.js, React, Tailwind CSS.
* **Back-end:** Python, FastAPI, Uvicorn.
* **Extração e Dados:** BeautifulSoup4, HTTPX, IGDB API.

## 🔜 Próximos Passos

A evolução da plataforma focará em personalização e ampliação do motor de busca:

* **Filtros de Interface em Tempo Real:** Conectar os estados visuais (Novo/Usado, Preço Mínimo/Máximo) para refinar os resultados devolvidos pelo scraper dinamicamente no front-end.
* **Expansão de Marketplaces:** Replicar a arquitetura de scraping blindada para vasculhar a Amazon e outras lojas de varejo, colocando-as em concorrência direta na tela.
* **Autenticação e Banco de Dados:** Integrar um BaaS (como Supabase) para permitir que os usuários façam login e gerenciem dados persistentes.
* **Gestão de Acervo:** Funcionalidade plena dos botões "Adicionar à Estante" e "Lista de Desejos".
* **Sistema de Notificações:** Alertas automatizados para quedas de preços em jogos favoritados.
