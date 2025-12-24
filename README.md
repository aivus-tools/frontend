Для корректной работы приложения необходимо добавить переменные окружения:

## Локальная разработка

Создайте файл `.env.local` в корне директории `frontend` (рядом с `package.json`) со следующим содержимым:

```env
# NextAuth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your_auth_secret_here

# Google OAuth (get from https://console.cloud.google.com/apis/credentials)
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here

# API Configuration
API_URL=http://localhost:8000
CALLBACK_URL=http://localhost:3000

# Optional
NEXT_PUBLIC_LOCALE=en
```

**Важно:**
- Файл `.env.local` должен находиться в корне директории `frontend` (не в `src`)
- После создания или изменения файла `.env.local` **обязательно перезапустите сервер разработки**
- Файл `.env.local` игнорируется git (не коммитится в репозиторий)

## Переменные окружения

`https://authjs.dev/`

AUTH_SECRET

`https://authjs.dev/getting-started/providers/google`

AUTH_GOOGLE_ID

AUTH_GOOGLE_SECRET

`https://authjs.dev/getting-started/providers/apple`

AUTH_APPLE_ID

AUTH_APPLE_SECRET


NEXT_PUBLIC_LOCALE = "en" | "ru" - опциональная переменная, отвечающая за локаль (по-умолчанию "en")



документация:
https://api.aivus.co/api/doc#/
