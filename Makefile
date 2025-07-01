.PHONY: help build up down logs clean dev prod restart status

help: ## Afficher l'aide
	@echo "Commandes disponibles:"
	@echo "  help         - Afficher cette aide"
	@echo "  build        - Construire les images Docker"
	@echo "  up           - Démarrer l'application en production"
	@echo "  down         - Arrêter l'application"
	@echo "  logs         - Voir les logs en temps réel"
	@echo "  clean        - Nettoyer les containers et volumes"
	@echo "  dev          - Démarrer en mode développement"
	@echo "  dev-build    - Construire et démarrer en mode développement"
	@echo "  prod         - Construire et démarrer en mode production"
	@echo "  restart      - Redémarrer l'application"
	@echo "  status       - Voir le statut des containers"

build: ## Construire les images Docker
	docker-compose build

up: ## Démarrer l'application en production
	docker-compose up -d

down: ## Arrêter l'application
	docker-compose down

logs: ## Voir les logs
	docker-compose logs -f

clean: ## Nettoyer les containers et volumes
	docker-compose down -v
	docker system prune -f

dev: ## Démarrer en mode développement
	docker-compose -f docker-compose.dev.yml up

dev-build: ## Construire et démarrer en mode développement
	docker-compose -f docker-compose.dev.yml up --build

prod: ## Démarrer en mode production
	docker-compose up --build -d

restart: ## Redémarrer l'application
	docker-compose restart

status: ## Voir le statut des containers
	docker-compose ps

# Commandes spécifiques aux services
logs-client: ## Voir les logs du client
	docker-compose logs -f client

logs-server: ## Voir les logs du serveur
	docker-compose logs -f server

logs-db: ## Voir les logs de la base de données
	docker-compose logs -f postgres

restart-client: ## Redémarrer le client
	docker-compose restart client

restart-server: ## Redémarrer le serveur
	docker-compose restart server

restart-db: ## Redémarrer la base de données
	docker-compose restart postgres
