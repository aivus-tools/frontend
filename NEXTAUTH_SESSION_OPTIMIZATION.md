# NextAuth Session Optimization

## Проблема: Избыточные запросы к API при каждом чтении сессии

### Симптомы:

При загрузке любой страницы в логах видно:
```
GET /app/group 200 in 3772ms
│ GET http://localhost:8000/api/v1/users/me 200 in 53ms
│ GET http://localhost:8000/api/v1/users/me 200 in 49ms  ← ДУБЛИКАТ!
```

**Каждая страница** делает 2+ запроса к `/api/v1/users/me` вместо нуля.

---

## Причина

### ❌ Неправильная реализация (было):

```typescript
// auth.ts
callbacks: {
  async session({ session, token }) {
    // ❌ КАЖДЫЙ раз при чтении сессии делается запрос к API!
    const aivusUser = await updateUserSession({
      userId: token.id as string,
      userGroup: token.group as string,
    });
    session.user.group = aivusUser.group;
    session.user.id = token.id as string;
    return session;
  },
}
```

**Что происходит:**
1. Страница загружается
2. Server Component вызывает `auth()` → **запрос к API**
3. Client Component вызывает `useSession()` → **ещё запрос к API**
4. React Strict Mode в dev → компонент монтируется дважды → **дублирование**

**Итог:** 2-4 запроса к API на каждую загрузку страницы!

---

## Решение

### ✅ Правильная реализация:

NextAuth использует **JWT токены**, которые хранятся в cookie и содержат всю необходимую информацию о пользователе. **Не нужно** запрашивать API при каждом чтении сессии!

```typescript
// auth.ts
callbacks: {
  async jwt({ token, user, trigger }) {
    // При первом логине копируем данные из user в token
    if (user) {
      token.group = user.group;
      token.id = user.id;
    }

    // ✅ Обновляем токен из API ТОЛЬКО при явном вызове update()
    if (trigger === 'update') {
      try {
        const aivusUser = await updateUserSession({
          userId: token.id as string,
          userGroup: (token.group as string) || GROUPS.unconfirmed,
        });
        token.group = aivusUser.group;
        logger.info('JWT token updated from API', { group: aivusUser.group });
      } catch (error) {
        logger.warn('Failed to update JWT from API, keeping existing token data', error);
      }
    }

    return token;
  },

  async session({ session, token }) {
    // ✅ Просто копируем данные из токена в сессию (без API-запросов!)
    session.user.group = token.group as Groups;
    session.user.id = token.id as string;
    return session;
  },
}
```

---

## Как работает новая логика

### 1. При логине:

```typescript
// authorize callback (Credentials Provider)
authorize: async (credentials) => {
  const user = await login(credentials);
  return {
    id: user.id,
    group: user.group,  // ← Данные из API
    // ...
  };
}

// jwt callback
async jwt({ token, user }) {
  if (user) {
    token.group = user.group;  // ← Сохраняем в JWT токен
    token.id = user.id;
  }
  return token;
}
```

**Результат:** Данные пользователя сохранены в JWT (cookie) и доступны без запросов к API.

---

### 2. При чтении сессии:

```typescript
// Server Component
const session = await auth();
console.log(session.user.group); // ← Читается из JWT, без API-запроса

// Client Component
const { data: session } = useSession();
console.log(session.user.group); // ← Читается из JWT, без API-запроса
```

**Результат:** 0 запросов к API при обычном чтении сессии!

---

### 3. При обновлении сессии (после изменений на backend):

```typescript
// Пример: Пользователь подтвердил email, нужно обновить group
const { update } = useSession();

// Вызываем update() → NextAuth вызовет jwt callback с trigger='update'
await update();

// Теперь session.user.group содержит актуальные данные из API
```

**Результат:** API вызывается **только когда явно нужно** обновить данные.

---

## Когда нужно вызывать `update()`?

### ✅ Когда данные изменились на backend:

1. **После подтверждения email:**
   ```typescript
   // confirm-email/page.tsx
   await updateSession(); // group: UNCONFIRMED → CONFIRMED
   ```

2. **После выбора роли (vendor/client):**
   ```typescript
   // hooks/useChangeGroup.ts
   await changeGroup(newGroup);
   await update(); // group: CONFIRMED → VENDOR/CLIENT
   ```

3. **После обновления профиля:**
   ```typescript
   await updateProfile({ name: 'New Name' });
   await update(); // обновляем session.user.name
   ```

---

### ❌ Когда НЕ нужно вызывать `update()`:

1. **При каждом переходе между страницами**
   - JWT токен валиден, данные актуальны
   - Просто читайте `session.user` без обновления

2. **В useEffect при монтировании компонента**
   ```typescript
   // ❌ Плохо
   useEffect(() => {
     update(); // Лишний запрос к API
   }, []);
   ```

3. **В Server Components**
   ```typescript
   // ❌ Плохо
   export default async function Page() {
     const session = await auth();
     await updateSession(); // Не работает в Server Components!
     // ...
   }
   ```

---

## Производительность

### До оптимизации:

- **Каждая страница:** 2-4 запроса к `/api/v1/users/me`
- **10 переходов:** 20-40 запросов
- **Время загрузки страницы:** +50-100ms на каждый запрос

### После оптимизации:

- **Обычная навигация:** 0 запросов
- **Только при update():** 1 запрос
- **Время загрузки страницы:** без дополнительных задержек

**Экономия:** 95%+ запросов к API!

---

## Как NextAuth работает с JWT

### 1. JWT Токен хранится в cookie:

```
Cookie: next-auth.session-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Токен содержит все данные пользователя:

```json
{
  "id": "4aa342ea-1438-4715-a434-8b31c580f67b",
  "group": "VENDOR",
  "email": "user@example.com",
  "name": "John Doe",
  "exp": 1702345678 // Время истечения
}
```

### 3. При чтении сессии:

- NextAuth **декодирует JWT** из cookie
- Возвращает данные без запросов к API
- Если токен истёк → пользователь разлогинивается

### 4. При вызове `update()`:

- NextAuth вызывает `jwt` callback с `trigger='update'`
- Мы запрашиваем свежие данные из API
- NextAuth создаёт **новый JWT** с обновлёнными данными
- Новый токен сохраняется в cookie

---

## Тестирование

### Проверка, что оптимизация работает:

1. **Откройте DevTools → Network tab**
2. **Перейдите на `/app/group`**
3. **Проверьте запросы:**
   - ✅ Должно быть **0 запросов** к `/api/v1/users/me`
   - ✅ Должна быть **1 загрузка страницы**

4. **Проверьте после `update()`:**
   ```typescript
   const { update } = useSession();
   await update(); // ← Должен быть ОДИН запрос к API
   ```

---

## Миграция существующего кода

### Если у вас есть код, который полагается на свежие данные из API:

**❌ Старый код (требует запроса при каждом чтении):**
```typescript
const session = await auth();
// Данные всегда свежие из API
```

**✅ Новый код (требует явного обновления):**
```typescript
const session = await auth();
// Данные из JWT (могут быть устаревшими)

// Если нужны свежие данные:
const { update } = useSession();
await update(); // Обновляем из API
```

---

## Debugging

### Как проверить, что в JWT токене:

```typescript
// В jwt callback
async jwt({ token }) {
  console.log('JWT token:', token);
  return token;
}
```

### Как проверить, что в сессии:

```typescript
// В session callback
async session({ session, token }) {
  console.log('Token:', token);
  console.log('Session:', session);
  return session;
}
```

### Как проверить trigger:

```typescript
async jwt({ token, trigger }) {
  console.log('JWT trigger:', trigger); // 'signIn', 'signUp', 'update', undefined
  return token;
}
```

---

## Best Practices

### ✅ DO:

1. **Читайте сессию напрямую** (без API-запросов):
   ```typescript
   const session = await auth();
   console.log(session.user.group);
   ```

2. **Обновляйте только когда данные изменились на backend:**
   ```typescript
   await changeGroupOnBackend();
   await update(); // Синхронизируем с backend
   ```

3. **Используйте JWT для хранения всех нужных полей:**
   ```typescript
   token.group = user.group;
   token.id = user.id;
   token.email = user.email; // ← Добавляйте всё, что нужно
   ```

---

### ❌ DON'T:

1. **Не запрашивайте API в session callback:**
   ```typescript
   // ❌ Плохо - вызывается при каждом чтении сессии
   async session({ session, token }) {
     const user = await fetch('/api/users/me');
     // ...
   }
   ```

2. **Не вызывайте update() без причины:**
   ```typescript
   // ❌ Плохо
   useEffect(() => {
     update(); // Зачем? Данные уже актуальны в JWT
   }, []);
   ```

3. **Не полагайтесь на устаревшие данные в JWT:**
   ```typescript
   // ❌ Плохо - данные могли измениться на backend
   const session = await auth();
   if (session.user.group === 'VENDOR') {
     // Что если админ изменил группу пользователя?
   }

   // ✅ Хорошо - обновляем перед критичной проверкой
   await update();
   const session = await auth();
   if (session.user.group === 'VENDOR') {
     // Теперь данные точно актуальны
   }
   ```

---

## Дополнительные ресурсы

- [NextAuth.js: JWT Session](https://next-auth.js.org/configuration/options#session)
- [NextAuth.js: Callbacks](https://next-auth.js.org/configuration/callbacks)
- [NextAuth.js: Update Session](https://next-auth.js.org/getting-started/client#updating-the-session)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Checklist для новых API-интеграций

- [ ] Данные пользователя хранятся в JWT токене
- [ ] `session` callback просто копирует из token в session (без API)
- [ ] `jwt` callback обновляет token из API только при `trigger === 'update'`
- [ ] `update()` вызывается только после изменений на backend
- [ ] Проверено в Network tab: 0 запросов к `/users/me` при обычной навигации

