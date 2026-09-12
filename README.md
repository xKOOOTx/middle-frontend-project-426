# Ссылка на render
[Рендер](https://middle-frontend-project-426.onrender.com/)

# Интернет-магазин комплектующих для ПК

[![hexlet-check](https://github.com/xKOOOTx/middle-frontend-project-426/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/xKOOOTx/middle-frontend-project-426/actions)
[![playwright](https://github.com/xKOOOTx/middle-frontend-project-426/actions/workflows/playwright.yml/badge.svg)](https://github.com/xKOOOTx/middle-frontend-project-426/actions)

Разработайте интернет-магазин комплектующих для ПК целиком на TypeScript.
Фронтенд пишете на любом TS-фреймворке (React, Vue, Svelte, Angular, Solid и др.).
Готового API здесь нет, поэтому сервер под свой интерфейс вы поднимаете сами,
а фреймворк для него и работу с базой выбираете на свой вкус. Спроектируйте API
через TypeSpec → OpenAPI, реализуйте регистрацию и авторизацию, главную
с промо-блоками, каталог с фильтрами и пагинацией, корзину, оформление заказа
и личный кабинет с историей заказов. Приложение деплоится в прод с третьего шага
и развивается под собственными браузерными тестами.

Учебный проект Хекслета: https://ru.hexlet.io/programs/middle-frontend
Как это должно работать: https://files.hexlet.app/a/qf7bsq

## Стек

- JavaScript

## Установка

<!-- Опишите установку: клонирование, зависимости, переменные окружения -->

```bash
git clone https://github.com/xKOOOTx/middle-frontend-project-426.git
cd middle-frontend-project-426
```

## Использование

<!-- Добавьте примеры запуска и запись asciinema — именно это смотрит работодатель -->

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.

## Команды запуска

### Корень репозитория
```bash
    npm run build    # ставит зависимости и собирает и фронт, и бэк (frontend/dist + backend/dist)
    npm run start    # стартует бэкенд (он же раздаёт собранный фронт) — предполагает, что переменные окружения уже заданы платформой (Render/CI), локально без них DATABASE_URL будет пустым
    npm run generate # вся цепочка контракта разом: TypeSpec → openapi.yaml → схемы бэка → типы фронта
    ### тесты (Playwright)
    npx playwright test                          # прогнать e2e-тесты (нужен уже поднятый сервер на localhost:3000 или BASE_URL=... на нужный адрес)
    npx playwright show-report                   # открыть HTML-отчёт последнего прогона
    npx playwright install --with-deps chromium  # разово поставить браузер + системные либы
```

### api (спецификация: TypeSpec → OpenAPI)
```bash
    npm run generate              # tsp compile . — собирает api/main.tsp в api/openapi.yaml
```


### frontend (запускать из папки /frontend или npm --prefix frontend <script>)
```bash
    npm run dev                   # dev-сервер Vite с hot reload, localhost:5173
    npm run build                 # tsc -b && vite build — собирает только фронт, без бэка
    npm run lint                  # oxlint
    npm run preview               # раздаёт уже собранный frontend/dist сам по себе, без бэкенда и API
    npm run generate:types        # openapi-typescript ../api/openapi.yaml -o src/types/api.d.ts — TS-типы из openapi.yaml
```

### backend
```bash
    npm run dev                   # tsx watch --env-file=.env src/index.ts — автоперезапуск на изменения, .env подхватывается сам
    npm run build                 # tsc → backend/dist
    npm run start                 # node dist/index.js — .env НЕ грузит сам, нужны переменные снаружи
    npm run generate:schemas      # openapi-box ../api/openapi.yaml -o src/schema.js — TypeBox-схемы валидации из openapi.yaml → backend/src/schema.js
```

```bash
    npx drizzle-kit generate      # сгенерировать SQL-миграцию из изменений backend/src/db/schema.ts
```

### Локальный прогон "как в проде" (собранный код, вручную заданные переменные — то, чем проверял Playwright)
```bash
    node --env-file=backend/.env backend/dist/index.js &
    curl --retry 20 --retry-delay 1 --retry-connrefused http://localhost:3000/api/health
```

### проверка живого сервера
```bash
    curl http://localhost:3000/api/health
```

### бд
```bash
    docker compose up -d         # поднять Postgres (из корня репозитория, файл compose.yaml)
    docker compose down          # остановить и удалить контейнер (volume с данными останется)
    docker compose ps            # проверить, что контейнер жив
    docker compose logs -f db    # логи базы
```

### дополнительные команды
```bash
kill $(lsof -t -i :3000)         # убить процессы (сервер)
```