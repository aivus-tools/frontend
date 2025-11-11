# Frontend Routing Architecture

## Обзор

Frontend использует **Next.js 15 App Router** с централизованным middleware для управления аутентификацией, редиректами и проксированием запросов к backend.

---

## Структура маршрутов

### 1. Файловая система (`src/app/`)

Next.js App Router создаёт маршруты на основе файловой структуры:

```
src/app/
├── page.tsx                    → /
├── auth/
│   ├── page.tsx               → /auth (страница логина/регистрации)
│   ├── confirm-email/
│   │   └── page.tsx          → /auth/confirm-email (подтверждение email)
│   ├── reset-password/
│   │   └── page.tsx          → /auth/reset-password (сброс пароля)
│   └── forgot-password/
│       └── page.tsx          → /auth/forgot-password (запрос сброса пароля)
├── app/
│   ├── confirm/
│   │   └── page.tsx          → /app/confirm (ожидание подтверждения email)
│   ├── group/
│   │   └── page.tsx          → /app/group (выбор роли: vendor/client)
│   ├── dashboard/
│   │   └── [projectId]/...  → /app/dashboard/:projectId/*
│   ├── rates/...             → /app/rates
│   └── templates/...         → /app/templates
└── external/
    └── page.tsx              → /external (публичный просмотр калькуляций)
```

### 2. Константы маршрутов (`src/constants/appRoute.ts`)

Централизованное определение всех путей:

```typescript
export const AppRoute = {
  HOME: '/',
  AUTH: '/auth',
  CONFIRM: '/app/confirm',
  GROUP: '/app/group',
  DASHBOARD: '/app/dashboard',
  EXTERNAL: '/external',
  // ...
} as const;
```

---

## Middleware (`src/middleware.ts`)

Middleware выполняется **перед каждым запросом** и отвечает за:

### 1. **Публичные зоны без проверок**

```typescript
// /external — полностью публичный доступ (для внешних пользователей)
if (req.nextUrl.pathname.startsWith('/external')) {
  return NextResponse.next();
}
```

**Назначение `/external`:**
- Просмотр калькуляций фрилансерами/партнёрами без авторизации
- Встраивание расчётов на внешних сайтах
- Специальный layout без Redux (минимальная загрузка)

---

### 2. **Публичные страницы аутентификации**

```typescript
const PUBLIC_AUTH_PATHS = [
  '/auth/confirm-email',      // Подтверждение email из письма
  '/auth/reset-password',     // Сброс пароля по токену
  '/auth/forgot-password',    // Запрос на сброс пароля
];
```

**Логика:**
- Эти страницы доступны **всем** (авторизованным и нет)
- Не редиректятся middleware
- Сами страницы решают, что делать с пользователем

**Пример флоу для `/auth/confirm-email`:**
1. Пользователь кликает ссылку из письма: `https://app.aivus.co/auth/confirm-email?token=xxx`
2. Middleware **пропускает** запрос (путь в `PUBLIC_AUTH_PATHS`)
3. Страница `confirm-email/page.tsx`:
   - Читает токен из URL
   - Вызывает `/service/auth/confirm-email?token=xxx` (проксируется через middleware)
   - Показывает спиннер/успех/ошибку
   - Если пользователь залогинен → обновляет сессию + редирект на `/app/dashboard`
   - Если не залогинен → редирект на `/auth` (с предзаполненным email)

---

### 3. **Редиректы для авторизованных на `/auth`**

```typescript
// Если путь /auth, но НЕ публичный, и пользователь залогинен
if (pathname.startsWith('/auth') && !isPublicAuthPath(pathname) && id && group) {
  if (userGroups.has(group)) {
    // VENDOR или CLIENT → на dashboard
    return NextResponse.redirect(new URL(AppRoute.DASHBOARD, req.url));
  } else {
    // UNCONFIRMED → на страницу ожидания подтверждения
    return NextResponse.redirect(new URL(AppRoute.CONFIRM, req.url));
  }
}
```

**Логика:**
- Если авторизованный `VENDOR`/`CLIENT` пытается зайти на `/auth` → редирект на `/app/dashboard`
- Если `UNCONFIRMED` → редирект на `/app/confirm` (там кнопка "Resend Email")

---

### 4. **Защита приватных маршрутов `/app/*`**

```typescript
if (pathname.startsWith('/app') && (!id || !group)) {
  // Нет авторизации → на страницу логина
  return NextResponse.redirect(new URL(AppRoute.AUTH, req.url));
}
```

**Логика:**
- Все пути внутри `/app/*` требуют авторизации
- Если сессии нет → редирект на `/auth`

---

### 5. **Проксирование API-запросов (`/service/*`)**

```typescript
if (pathname.startsWith('/service/')) {
  let newPathname = pathname.replace(/^\/service\//, '/api/v1/');
  
  // Добавляем HMAC-подпись для всех запросов, кроме /api/v1/auth/*
  if (!newPathname.startsWith('/api/v1/auth/')) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await createHmacSHA256(`${method}:${newPathname}:${timestamp}:${id}:${group}`);
    headers.set('x-timestamp', timestamp);
    headers.set('x-user-id', id ?? '');
    headers.set('x-user-group', group ?? '');
    headers.set('x-signature', signature);
  }

  // Проксируем на backend
  return NextResponse.rewrite(new URL(newPathname, process.env.API_URL), {
    request: { headers },
  });
}
```

**Назначение:**
- Клиентские компоненты вызывают `/service/auth/login`, `/service/users/me` и т.д.
- Middleware подменяет путь на backend: `/service/...` → `http://localhost:8000/api/v1/...`
- Автоматически добавляет HMAC-заголовки для защищённых эндпоинтов
- Публичные эндпоинты аутентификации (`/api/v1/auth/*`) идут без HMAC

---

## Матрица доступа

| Путь                         | Не авторизован | UNCONFIRMED       | CONFIRMED         | VENDOR/CLIENT     | Описание                          |
|------------------------------|----------------|-------------------|-------------------|-------------------|-----------------------------------|
| `/`                          | → `/auth`      | → `/app/confirm`  | → `/app/group`    | → `/app/dashboard`| Главная (редирект)                |
| `/auth`                      | ✅ Доступ      | → `/app/confirm`  | → `/app/group`    | → `/app/dashboard`| Логин/регистрация                 |
| `/auth/confirm-email`        | ✅ Доступ      | ✅ Доступ         | ✅ Доступ         | ✅ Доступ         | Подтверждение email (публично)    |
| `/auth/reset-password`       | ✅ Доступ      | ✅ Доступ         | ✅ Доступ         | ✅ Доступ         | Сброс пароля (публично)           |
| `/auth/forgot-password`      | ✅ Доступ      | ✅ Доступ         | ✅ Доступ         | ✅ Доступ         | Запрос сброса пароля (публично)   |
| `/app/confirm`               | → `/auth`      | ✅ Доступ         | → `/app/group`    | → `/app/dashboard`| Ожидание подтверждения email      |
| `/app/group`                 | → `/auth`      | → `/app/confirm`  | ✅ Доступ         | → `/app/dashboard`| Выбор роли (vendor/client)        |
| `/app/dashboard`             | → `/auth`      | → `/app/confirm`  | → `/app/group`    | ✅ Доступ         | Дашборд проектов                  |
| `/app/rates`                 | → `/auth`      | → `/app/confirm`  | → `/app/group`    | ✅ Доступ         | Управление рейтами                |
| `/app/templates`             | → `/auth`      | → `/app/confirm`  | → `/app/group`    | ✅ Доступ         | Шаблоны калькуляций               |
| `/external`                  | ✅ Доступ      | ✅ Доступ         | ✅ Доступ         | ✅ Доступ         | Публичный просмотр (без проверок) |

---

## Как добавить новый публичный путь в `/auth`

1. Добавить путь в константу `PUBLIC_AUTH_PATHS` в `middleware.ts`:

```typescript
const PUBLIC_AUTH_PATHS = [
  '/auth/confirm-email',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/auth/your-new-path',  // ← новый путь
];
```

2. Создать файл `src/app/auth/your-new-path/page.tsx`

3. Готово! Middleware автоматически пропустит этот путь для всех пользователей.

---

## Как работает защита от несанкционированного доступа

### Backend: HMAC Authentication Middleware

Django проверяет каждый запрос к `/api/v1/*` (кроме whitelist):

```python
# Backend: aivus_backend/core/middleware.py
WHITELISTED_PATHS = [
    '/admin/',
    '/accounts/',
    '/static/',
    '/api/v1/auth/',  # Публичные эндпоинты аутентификации
]

def process_view(self, request, view_func, ...):
    if request.path in WHITELISTED_PATHS:
        return None  # Пропустить проверку
    
    # Проверить HMAC-подпись
    signature = request.headers.get('x-signature')
    expected_signature = hmac_sha256(f"{method}:{path}:{timestamp}:{user_id}:{user_group}")
    
    if signature != expected_signature:
        return JsonResponse({"error": "Invalid signature"}, status=401)
```

### Frontend: NextAuth Session + Middleware

- NextAuth хранит сессию в JWT-токене (cookie `next-auth.session-token`)
- Middleware читает сессию: `req.auth?.user`
- На основе `group` пользователя решает, куда редиректить
- API-запросы через `/service/*` автоматически получают HMAC-заголовки

---

## Важные замечания

1. **Все публичные страницы под `/auth` должны быть в `PUBLIC_AUTH_PATHS`**
   - Иначе авторизованные пользователи будут редиректиться

2. **`/external` — полностью публичный**
   - Используется для встраивания калькуляций на внешних сайтах
   - Не требует авторизации вообще

3. **HMAC-подпись добавляется автоматически**
   - Клиентские компоненты вызывают `/service/...`
   - Middleware подставляет заголовки и проксирует на backend

4. **Сессия хранится в JWT**
   - Обновляется через `updateSession()` из `next-auth/react`
   - После подтверждения email нужно явно обновить сессию, чтобы получить новый `group`

---

## Дальнейшие улучшения

- [ ] Добавить rate limiting для публичных страниц (`/auth/confirm-email`, `/auth/reset-password`)
- [ ] Логировать неудачные попытки доступа к защищённым маршрутам
- [ ] Кэшировать статус сессии на клиенте (React Context) для уменьшения запросов к `/api/auth/session`
- [ ] Добавить E2E тесты для всех флоу авторизации (Playwright/Cypress)

