# Тестирование Email Confirmation Flow

## Шаг 1: Подготовка

1. **Убедитесь, что backend запущен:**
   ```bash
   cd Backend/aivus_backend
   docker compose -f docker-compose.local.yml up -d
   ```

2. **Убедитесь, что frontend запущен:**
   ```bash
   cd Frontend
   PORT=3000 npm run dev
   ```

3. **Откройте Mailpit:** http://localhost:8025

---

## Шаг 2: Создание тестового пользователя

1. Перейдите на http://localhost:3000/auth
2. Зарегистрируйтесь с новым email (например, `test@test.com`)
3. **Ожидаемый результат:**
   - Редирект на `/app/confirm`
   - Страница с кнопкой "Resend"
   - Письмо в Mailpit

---

## Шаг 3: Проверка статуса в БД

```bash
cd Backend/aivus_backend
docker compose -f docker-compose.local.yml exec django python manage.py shell
```

```python
from aivus_backend.users.models import User
user = User.objects.filter(email='test@test.com').first()
print(f"Email: {user.email}")
print(f"Group: {user.group}")  # Должно быть UNCONFIRMED
```

---

## Шаг 4: Подтверждение email

1. Откройте Mailpit: http://localhost:8025
2. Найдите письмо "Confirm your email - Aivus"
3. Кликните по ссылке в письме
4. **Ожидаемый результат:**
   - Страница `/auth/confirm-email?token=...`
   - Спиннер "Confirming your e-mail..."
   - Зелёное уведомление "E-mail confirmed"
   - Через 1.5 сек → редирект на `/app/group`
   - Страница выбора роли ("I'm a client" / "I'm a vendor")

---

## Шаг 5: Проверка обновления в БД

```python
user.refresh_from_db()
print(f"Group after confirmation: {user.group}")  # Должно быть CONFIRMED
```

---

## Шаг 6: Выбор роли

1. На странице `/app/group` кликните "I'm a vendor"
2. **Ожидаемый результат:**
   - Редирект на `/app/dashboard`
   - Дашборд vendor

---

## Шаг 7: Проверка финального статуса

```python
user.refresh_from_db()
print(f"Group after role selection: {user.group}")  # Должно быть VENDOR
```

---

## Проблемы и решения

### Проблема: Редиректит обратно на `/app/confirm`

**Причина:** NextAuth JWT cookie не обновился после `updateSession()`

**Решение:** Используем `window.location.href` вместо `router.replace()` для принудительной перезагрузки

---

### Проблема: "Invalid or expired confirmation token"

**Причина:** Токен используется дважды (React Strict Mode)

**Решение:** Используем `useOnceAsync` hook

---

### Проблема: Middleware редиректит на `/app/confirm` для `CONFIRMED`

**Причина:** В middleware не было обработки группы `CONFIRMED`

**Решение:** Добавлен редирект `CONFIRMED` → `/app/group`

---

## Логи для отладки

### Backend (Django):

```bash
docker compose -f docker-compose.local.yml logs django --tail=50 --follow
```

Ищите:
```
INFO Confirmation email sent to ...
GET /api/v1/auth/confirm-email?token=... HTTP/1.1" 200
```

### Frontend (Next.js):

Смотрите в консоль терминала, где запущен `npm run dev`.

Ищите:
```
update session { user: { group: 'CONFIRMED', ... } }
redirecting to /app/group
```

### Browser DevTools:

1. **Network tab:**
   - ОДИН запрос к `/service/auth/confirm-email?token=...`
   - Статус: 200 OK

2. **Console tab:**
   - Нет ошибок
   - Логи от NextAuth (если `DEBUG=true`)

---

## Checklist успешного флоу

- [ ] Регистрация → `/app/confirm`
- [ ] Письмо получено в Mailpit
- [ ] Клик по ссылке → `/auth/confirm-email?token=...`
- [ ] Спиннер → "E-mail confirmed" → редирект
- [ ] Перенаправление на `/app/group`
- [ ] Выбор роли → `/app/dashboard`
- [ ] В БД `group = 'VENDOR'` или `'CLIENT'`
- [ ] При обновлении `/` редиректит на `/app/dashboard`

---

## Матрица редиректов (для проверки)

| URL          | User Group    | Ожидаемый редирект       |
|--------------|---------------|--------------------------|
| `/`          | Не авторизован| → `/auth`                |
| `/`          | UNCONFIRMED   | → `/app/confirm`         |
| `/`          | CONFIRMED     | → `/app/group`           |
| `/`          | VENDOR/CLIENT | → `/app/dashboard`       |
| `/auth`      | UNCONFIRMED   | → `/app/confirm`         |
| `/auth`      | CONFIRMED     | → `/app/group`           |
| `/auth`      | VENDOR/CLIENT | → `/app/dashboard`       |
| `/app/confirm` | CONFIRMED   | → `/app/group`           |
| `/app/confirm` | VENDOR/CLIENT | → `/app/dashboard`     |
| `/app/group` | UNCONFIRMED   | → `/app/confirm`         |
| `/app/group` | CONFIRMED     | ✅ Доступ (выбор роли)   |
| `/app/group` | VENDOR/CLIENT | → `/app/dashboard`       |
| `/app/dashboard` | UNCONFIRMED | → `/app/confirm`       |
| `/app/dashboard` | CONFIRMED | → `/app/group`           |
| `/app/dashboard` | VENDOR/CLIENT | ✅ Доступ             |

