# E2E Tests for AIVUS Client

Автоматизированные тесты для клиентских сценариев использования Playwright.

## Установка

```bash
cd Frontend
npm install
npx playwright install chromium
```

## Запуск тестов

**ВАЖНО:** Перед запуском E2E тестов убедись что backend запущен!

```bash
# В корне проекта (отдельный терминал)
make backend

# Или запусти всё сразу
make dev
```

### Все тесты

```bash
npm run test:e2e
```

### Только клиентские тесты

```bash
npm run test:e2e:client
```

### С UI интерфейсом (recommended)

```bash
npm run test:e2e:ui
```

### С видимым браузером

```bash
npm run test:e2e:headed
```

### Отладка конкретного теста

```bash
npm run test:e2e:debug
```

## Переменные окружения

Создай `.env.local` в корне `Frontend/`:

```env
SMOKE_TEST_EMAIL=p@p.pp
SMOKE_TEST_PASSWORD=iiiijjjj
SMOKE_TEST_URL=http://localhost:3000
```

## Структура тестов

```
e2e/
├── brief-flows/                  # Live-LLM сценарии брифа v3 (project=brief-flows)
│   ├── anon-create.spec.ts       # Публичный бриф: start -> voice -> chat -> Sign up CTA
│   ├── anon-register.spec.ts     # Продолжение: регистрация + confirm-email -> кабинет
│   ├── logged-in.spec.ts         # Залогиненный клиент: /public-brief -> auto-finalize
│   └── wix-webhook.spec.ts       # Inbound Wix webhook: anon URL + logged-in claim
├── client/
│   ├── public-brief.spec.ts      # legacy v2 (skip)
│   └── authenticated-brief-flow.spec.ts # legacy v2 (skip)
├── helpers/
│   ├── briefFlowV3.ts            # Селекторы и шаги флоу брифа v3
│   ├── tokenSource.ts            # Источник confirm-токена: mailpit | endpoint
│   ├── mailpit.ts                # Достаёт confirm-ссылку из Mailpit (:8025)
│   ├── endpointTokenSource.ts    # Достаёт токен из guarded backend-эндпоинта (staging)
│   └── wix.ts                    # POST в Wix webhook
├── auth.setup.ts                 # Авторизация vendor (project=setup)
├── client-auth.setup.ts          # Авторизация client (project=client-setup)
└── smoke.spec.ts                 # Базовые smoke tests
```

## Live-LLM brief flows (project `brief-flows`)

Четыре сценария гоняют реальный пайплайн Brief AI v3 (Gemini через Vertex), поэтому
они медленные (1-5 минут каждый) и вынесены в отдельный opt-in project — в дефолтный
`npm run test:e2e` не попадают.

Запуск:

```bash
make e2e-flows                 # все 4 сценария, последовательно (workers=1)
# или
cd Frontend && npm run test:e2e:flows
# один сценарий:
cd Frontend && npx playwright test brief-flows/wix-webhook.spec.ts --project=brief-flows
```

Требования к окружению (всё локально):

- backend в Docker и dev server на :3000 (`make dev`);
- Mailpit (`aivus_backend_local_mailpit`, HTTP API на :8025) — письма подтверждения
  ловятся через него, `RESEND_API_KEY` должен быть пустым;
- Vertex/Gemini настроен (бриф реально генерируется);
- `client-setup` логинит клиента `a@a.aa` / `iiiijjjj` и сохраняет `e2e/.auth/client.json`.

Переменные окружения (есть дефолты, переопределять не обязательно):

- `MAILPIT_URL` (по умолчанию `http://localhost:8025`);
- `BACKEND_URL` (по умолчанию `http://localhost:8000`);
- `WIX_WEBHOOK_SECRET` (по умолчанию `local-dev-wix-secret`);
- `E2E_CLIENT_EMAIL` / `E2E_CLIENT_PASSWORD` (по умолчанию `a@a.aa` / `iiiijjjj`);
- `E2E_TOKEN_SOURCE` (`mailpit` по умолчанию | `endpoint`) и `E2E_CONFIRMATION_TOKEN_SECRET` —
  для staging без Mailpit (реальный Resend). При `endpoint` confirm-токен берётся из
  guarded backend-эндпоинта `/api/v1/auth/e2e-confirmation-token`, который на staging
  включается env `E2E_CONFIRMATION_TOKEN_ENABLED=True` + тот же секрет (см. `Specs/ENV_VARIABLES.md`).

Заметки:

- голосовая кнопка прогоняется через fake media devices (launch args проекта), реальный
  микрофон не нужен;
- вложение на старте — текстовый файл: Gemini отвергает мелкие/невалидные изображения,
  текстовый референс детерминирован;
- Wix webhook возвращает `briefUrl` вида `/public-brief/<id>?token=...&taskId=...`
  (не `/app/brief/...`).

## Покрытие тестами

### Public Brief (`public-brief.spec.ts`)

- ✅ Создание публичного брифа через AI
- ✅ AI чат и генерация секций
- ✅ Ручное редактирование в публичном брифе
- ✅ Сохранение после reload
- ✅ Баннер регистрации
- ✅ Read-only режим редактора
- ✅ Token persistence в localStorage
- ✅ Лимит сообщений (20)

### Brief Editor (`brief-editor.spec.ts`)

- ✅ Сохранение изменений после reload
- ✅ Быстрое переключение между секциями (immediate flush)
- ✅ Сохранение pending changes при unmount
- ✅ Множественные изменения в одной секции
- ✅ Отображение cost badge
- ✅ Toolbar для editable brief

### Client Dashboard (`dashboard-client.spec.ts`)

- ✅ Отображение dashboard с sidebar
- ✅ Кнопка "Create Brief"
- ✅ Навигационные табы (Brief, Comparison)
- ✅ Фильтры по статусу
- ✅ User menu
- ✅ Навигация к деталям брифа
- ✅ Поиск

## Отчеты

После прогона тестов:

```bash
npx playwright show-report
```

Откроется HTML-отчет с:

- ✅ / ❌ статусом каждого теста
- Screenshots при failures
- Traces для debugging
- Timing information

## CI/CD

Тесты можно запустить в GitHub Actions:

```yaml
- name: Run E2E tests
  run: |
    cd Frontend
    npm ci
    npx playwright install chromium
    npm run test:e2e
```

## Tips

1. **Ускорить тесты**: используй `test.skip()` для пропуска медленных тестов
2. **Debug**: используй `await page.pause()` для остановки выполнения
3. **Селекторы**: предпочитай `getByRole()` и `getByText()` вместо CSS-селекторов
4. **Ожидания**: всегда используй `await expect()` вместо `waitForTimeout()`

## Troubleshooting

### Тесты падают с timeout

- Убедись что frontend и backend запущены
- Увеличь timeout: `test.setTimeout(60000)`

### Brief не создается

- Проверь что Redis и Celery работают
- Проверь что OpenAI API key настроен

### Editor не сохраняет изменения

- Убедись что debounce отработал (600ms)
- Проверь network requests в отчете

## Примеры запуска

```bash
# Только один тест
npm run test:e2e -- -g "should persist manual edits"

# Только failed тесты
npm run test:e2e -- --last-failed

# Параллельно на 4 воркерах
npm run test:e2e -- --workers=4

# С видео записью
npm run test:e2e -- --video=on
```
