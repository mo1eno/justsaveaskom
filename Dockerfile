# Используем официальный образ posthog
FROM posthog/posthog:latest

# Если нужно, можешь добавить свои настройки, например, ENV переменные,
# но чаще всего их задают через docker-compose или при запуске контейнера

# Пример задания ENV, если хочешь прямо в Dockerfile (необязательно):
ENV DATABASE_URL=postgres://posthog:password@db:5432/posthog
ENV REDIS_URL=redis://redis:6379/0
ENV SECRET_KEY=some-secret-key

# Порт
EXPOSE 8000

# Команда запуска по умолчанию у posthog/posthog уже есть
# CMD ["./posthog"] # не нужен, т.к. уже в образе
