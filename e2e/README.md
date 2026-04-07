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
├── client/
│   ├── public-brief.spec.ts      # Публичный бриф + AI
│   ├── brief-editor.spec.ts      # Редактор (corner cases)
│   └── dashboard-client.spec.ts  # Dashboard клиента
├── helpers/
│   ├── brief.ts                  # Хелперы для брифов
│   └── editor.ts                 # Хелперы для редактора
├── auth.setup.ts                 # Авторизация vendor
└── smoke.spec.ts                 # Базовые smoke tests
```

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
