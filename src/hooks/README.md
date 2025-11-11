# Custom Hooks

## `useOnce` / `useOnceAsync`

Hooks для выполнения эффектов **строго один раз**, даже в React Strict Mode.

### Проблема

В development режиме React Strict Mode монтирует компоненты дважды:

```typescript
useEffect(() => {
  confirmEmail(token); // ❌ Выполнится дважды в dev!
}, [token]);
```

Это приводит к:
- Дублированию API-запросов
- Повторному использованию одноразовых токенов
- Ошибкам "Token already used"

### Решение

```typescript
import { useOnceAsync } from '@/hooks/useOnce';

useOnceAsync(async () => {
  await confirmEmail(token); // ✅ Выполнится строго один раз
}, [token]);
```

---

## API

### `useOnce(effect, deps)`

Для синхронных эффектов с поддержкой cleanup.

**Параметры:**
- `effect: () => void | (() => void)` — функция-эффект (может вернуть cleanup)
- `deps: React.DependencyList` — зависимости (как в `useEffect`)

**Пример:**

```typescript
import { useOnce } from '@/hooks/useOnce';

useOnce(() => {
  const subscription = subscribeToEvents();
  
  // Cleanup функция
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

### `useOnceAsync(effect, deps)`

Для асинхронных эффектов (без поддержки cleanup).

**Параметры:**
- `effect: () => Promise<void>` — async функция-эффект
- `deps: React.DependencyList` — зависимости (как в `useEffect`)

**Пример:**

```typescript
import { useOnceAsync } from '@/hooks/useOnce';

useOnceAsync(async () => {
  const response = await fetch('/api/confirm-email?token=' + token);
  const data = await response.json();
  console.log('Email confirmed:', data);
}, [token]);
```

---

## Когда использовать

### ✅ Используйте `useOnce` для:

1. **Критичные операции, которые нельзя дублировать:**
   - Email confirmation (изменяет группу в БД)
   - Payment processing (списание денег)
   - Создание/удаление записей

2. **Операции с одноразовыми токенами:**
   - Подтверждение email
   - Сброс пароля
   - Активация аккаунта

3. **Инициализация сторонних библиотек:**
   ```typescript
   useOnce(() => {
     analytics.init({ apiKey: '...' });
   }, []);
   ```

4. **Логирование событий один раз:**
   ```typescript
   useOnceAsync(async () => {
     await logPageView('/dashboard');
   }, []);
   ```

---

### ❌ НЕ используйте `useOnce` для:

1. **Обычных GET-запросов (чтение данных):**
   ```typescript
   // ❌ Плохо - дублирование безопасно, не критично
   useOnceAsync(async () => {
     const users = await fetchUsers();
     setUsers(users);
   }, []);
   
   // ✅ Хорошо - используйте обычный useEffect или RTK Query
   useEffect(() => {
     fetchUsers().then(setUsers);
   }, []);
   ```

2. **Операций, которые должны реагировать на изменения:**
   ```typescript
   // ❌ Плохо - не будет обновляться при изменении userId
   useOnceAsync(async () => {
     const user = await fetchUser(userId);
     setUser(user);
   }, [userId]);
   
   // ✅ Хорошо - используйте обычный useEffect
   useEffect(() => {
     fetchUser(userId).then(setUser);
   }, [userId]);
   ```

3. **RTK Query или React Query запросов:**
   ```typescript
   // ❌ Плохо - RTK Query уже имеет встроенную дедупликацию
   const [fetchData] = useLazyFetchDataQuery();
   useOnceAsync(async () => {
     await fetchData();
   }, []);
   
   // ✅ Хорошо - используйте RTK Query напрямую
   const { data } = useFetchDataQuery();
   ```

---

## Примеры из проекта

### 1. Email Confirmation (`confirm-email/page.tsx`)

**До:**
```typescript
const hasConfirmed = useRef(false);

useEffect(() => {
  if (hasConfirmed.current) return;
  hasConfirmed.current = true;
  
  const confirm = async () => {
    const response = await fetch('/service/auth/confirm-email?token=' + token);
    // ...
  };
  
  void confirm();
}, [token]);
```

**После:**
```typescript
useOnceAsync(async () => {
  if (!token) return;
  
  const response = await fetch('/service/auth/confirm-email?token=' + token);
  // ...
}, [token]);
```

---

### 2. Resend Confirmation (`confirm.tsx`)

**До:**
```typescript
useEffect(() => {
  let isExecuted = false;
  
  const confirmToken = async () => {
    if (!token || isExecuted) return;
    isExecuted = true;
    
    await confirmEmail(token).unwrap();
  };
  
  void confirmToken();
}, [token]);
```

**После:**
```typescript
useOnceAsync(async () => {
  if (!token) return;
  
  await confirmEmail(token).unwrap();
}, [token]);
```

---

## Как это работает

### Внутренняя реализация:

```typescript
export function useOnceAsync(effect, deps) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    
    void effect();
  }, deps);
}
```

**Ключевой момент:** `useRef` **НЕ сбрасывается** при unmount/remount в Strict Mode!

| Подход           | Re-render | Unmount/Remount | Strict Mode |
|------------------|-----------|-----------------|-------------|
| `let isExecuted` | ❌ Сброс   | ❌ Сброс         | ❌ Не защищает |
| `useRef`         | ✅ Сохран. | ✅ Сохран.       | ✅ Защищает |

---

## Тестирование

### Проверка, что эффект выполняется один раз:

1. Откройте DevTools → **Network tab**
2. Перейдите на страницу с `useOnceAsync`
3. **Должен быть ОДИН запрос** к API (не два!)

### В production:

В production Strict Mode отключён, поэтому:
- `useOnce` ведёт себя как обычный `useEffect`
- Не создаёт лишних проблем с производительностью

---

## Best Practices

### ✅ DO:

1. **Используйте для критичных операций:**
   ```typescript
   useOnceAsync(async () => {
     await processPayment(orderId); // Нельзя дублировать!
   }, [orderId]);
   ```

2. **Проверяйте условия внутри эффекта:**
   ```typescript
   useOnceAsync(async () => {
     if (!token) return; // ← Защита от undefined
     await confirmEmail(token);
   }, [token]);
   ```

3. **Логируйте важные события:**
   ```typescript
   useOnceAsync(async () => {
     console.log('Email confirmation started');
     await confirmEmail(token);
     console.log('Email confirmation completed');
   }, [token]);
   ```

---

### ❌ DON'T:

1. **Не используйте для обычных запросов:**
   ```typescript
   // ❌ Плохо - дублирование безопасно
   useOnceAsync(async () => {
     const users = await fetchUsers();
   }, []);
   
   // ✅ Хорошо - используйте useEffect
   useEffect(() => {
     fetchUsers();
   }, []);
   ```

2. **Не забывайте про зависимости:**
   ```typescript
   // ❌ Плохо - пропущены зависимости
   useOnceAsync(async () => {
     await confirmEmail(token);
   }, []); // token не указан!
   
   // ✅ Хорошо
   useOnceAsync(async () => {
     await confirmEmail(token);
   }, [token]);
   ```

3. **Не используйте для подписок (используйте `useOnce` с cleanup):**
   ```typescript
   // ❌ Плохо - нет cleanup
   useOnceAsync(async () => {
     subscribe();
   }, []);
   
   // ✅ Хорошо
   useOnce(() => {
     const subscription = subscribe();
     return () => subscription.unsubscribe();
   }, []);
   ```

---

## FAQ

### Q: Зачем нужен отдельный hook, если можно использовать `useRef` напрямую?

**A:** DRY (Don't Repeat Yourself). Вместо копирования 5 строк в каждом компоненте, используем 1 строку с `useOnce`.

---

### Q: Почему не просто отключить Strict Mode?

**A:** Strict Mode помогает выявить проблемы с утечками памяти и некорректными side-effects. Лучше использовать `useOnce` для критичных операций, чем отключать полезную проверку.

---

### Q: Можно ли использовать `useOnce` с RTK Query?

**A:** Не нужно! RTK Query уже имеет встроенную дедупликацию запросов. Используйте `useOnce` только для ручных `fetch` или операций без библиотек.

---

### Q: Работает ли `useOnce` в production?

**A:** Да! В production Strict Mode отключён, поэтому `useOnce` работает как обычный `useEffect`. Никаких проблем с производительностью.

---

## Связанные документы

- [REACT_STRICT_MODE.md](../../REACT_STRICT_MODE.md) — подробная документация про React Strict Mode
- [React Docs: Strict Mode](https://react.dev/reference/react/StrictMode)
- [React 18: New Strict Mode Behaviors](https://react.dev/blog/2022/03/29/react-v18#new-strict-mode-behaviors)

