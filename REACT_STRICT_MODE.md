# React Strict Mode & Duplicate Side Effects

## Проблема

В **development режиме** Next.js включает React Strict Mode, который **специально монтирует компоненты дважды**, чтобы помочь выявить проблемы с side-effects.

### Симптомы:

1. **API-запросы дублируются** (видны в Network tab)
2. **Уведомления показываются дважды** (два toast-сообщения)
3. **`useEffect` срабатывает дважды** (даже с пустым массивом зависимостей `[]`)

### Пример:

```typescript
useEffect(() => {
  fetch('/api/confirm-email?token=xxx'); // ❌ Вызовется дважды в dev!
}, []);
```

---

## Почему это происходит?

React Strict Mode в dev-режиме:
1. Монтирует компонент
2. **Unmounts компонент** (вызывает cleanup)
3. **Re-mounts компонент**

Это помогает выявить утечки памяти и побочные эффекты, которые не очищаются корректно.

**Важно:** В production-сборке Strict Mode **отключён**, и компоненты монтируются только один раз.

---

## Решения

### ✅ Вариант 1: Флаг `isExecuted` (рекомендуется)

Используйте локальный флаг внутри `useEffect`:

```typescript
useEffect(() => {
  let isExecuted = false;

  const fetchData = async () => {
    if (isExecuted) return; // ← Защита от повторного вызова
    isExecuted = true;

    const response = await fetch('/api/data');
    // ...
  };

  void fetchData();
}, []);
```

**Плюсы:**
- Работает в любом окружении (dev/prod)
- Простая реализация
- Нет внешних зависимостей

**Минусы:**
- Нужно добавлять в каждый `useEffect` с side-effects

---

### ✅ Вариант 2: AbortController для fetch (для отмены запросов)

Используйте `AbortController` для корректной отмены fetch-запросов:

```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal, // ← Передаём сигнал для отмены
      });
      // ...
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Запрос был отменён, игнорируем ошибку
      }
      console.error(error);
    }
  };

  void fetchData();

  return () => {
    controller.abort(); // ← Отменяем запрос при unmount
  };
}, []);
```

**Плюсы:**
- Корректно отменяет HTTP-запросы
- Стандартный Web API
- Предотвращает race conditions

**Минусы:**
- Работает только с `fetch` (не подходит для других side-effects)

---

### ✅ Вариант 3: Комбинация флага + AbortController (лучшее решение)

```typescript
useEffect(() => {
  let isExecuted = false;
  const controller = new AbortController();

  const confirm = async () => {
    if (isExecuted) return; // ← Защита от React Strict Mode
    isExecuted = true;

    try {
      const response = await fetch('/service/auth/confirm-email?token=xxx', {
        method: 'GET',
        signal: controller.signal, // ← Защита от race conditions
      });
      // ...
    } catch (error) {
      if (controller.signal.aborted) {
        return; // Запрос был отменён
      }
      console.error(error);
    }
  };

  void confirm();

  return () => {
    controller.abort();
  };
}, [token]);
```

**Плюсы:**
- Двойная защита: от React Strict Mode + от race conditions
- Корректная отмена запросов при unmount
- Best practice для критичных side-effects (регистрация, оплата и т.д.)

---

### ✅ Вариант 4: `useRef` (для одноразовых операций)

```typescript
const hasRun = useRef(false);

useEffect(() => {
  if (hasRun.current) return;
  hasRun.current = true;

  fetch('/api/data');
}, []);
```

**Когда использовать:**
- ✅ Для критичных операций, которые должны выполниться **строго один раз** (email confirmation, payment)
- ✅ Когда операция меняет состояние на сервере (создание, удаление записи)

**Важно:**
- `useRef` **НЕ сбрасывается** при unmount/remount в Strict Mode
- Защищает от дублирования даже при повторном монтировании компонента
- Используйте только для операций, где дублирование недопустимо

**Пример (email confirmation):**
```typescript
const hasConfirmed = useRef(false);

useEffect(() => {
  if (!token || hasConfirmed.current) return;
  hasConfirmed.current = true; // ← Защита от React Strict Mode

  confirmEmail(token); // Выполнится строго один раз
}, [token]);
```

---

### ❌ Вариант 5: Отключить Strict Mode (не рекомендуется)

```typescript
// next.config.mjs
export default {
  reactStrictMode: false, // ❌ НЕ ДЕЛАЙТЕ ТАК
};
```

**Почему плохо:**
- Скрывает настоящие проблемы в коде
- Strict Mode помогает выявить утечки памяти и ошибки
- В production код может вести себя по-другому

---

## Примеры из проекта

### 1. Подтверждение email (`/auth/confirm-email`)

**Проблема:** Токен используется дважды → backend возвращает "Token already used"

**Решение:**

```typescript
useEffect(() => {
  if (!token) return;

  let isExecuted = false; // ← Флаг
  const controller = new AbortController(); // ← AbortController

  const confirm = async () => {
    if (isExecuted) return;
    isExecuted = true;

    try {
      const response = await fetch(`/service/auth/confirm-email?token=${token}`, {
        method: 'GET',
        signal: controller.signal,
      });
      // ...
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error(error);
    }
  };

  void confirm();

  return () => {
    controller.abort();
  };
}, [token, session?.user, updateSession, router, messageApi]);
```

---

### 2. Resend confirmation email (`/app/confirm`)

**Проблема:** При клике на кнопку "Resend" отправляется 2 письма

**Причина:** RTK Query mutation вызывается дважды из-за React re-render

**Решение:** RTK Query уже имеет встроенную дедупликацию, но `useEffect` всё равно нужно защитить:

```typescript
useEffect(() => {
  let isExecuted = false;

  const confirmToken = async () => {
    if (!token || isExecuted) return;
    isExecuted = true;

    try {
      await confirmEmail(token).unwrap();
      // ...
    } catch (error) {
      console.error(error);
    }
  };

  void confirmToken();
}, [confirmEmail, token]);
```

---

## Правила для `useEffect` с side-effects

### ✅ DO:

1. **Всегда защищайте критичные операции флагом `isExecuted`**
   ```typescript
   let isExecuted = false;
   if (isExecuted) return;
   isExecuted = true;
   ```

2. **Используйте `AbortController` для fetch-запросов**
   ```typescript
   const controller = new AbortController();
   fetch(url, { signal: controller.signal });
   return () => controller.abort();
   ```

3. **Проверяйте отмену перед обновлением state**
   ```typescript
   if (controller.signal.aborted) return;
   setData(result);
   ```

4. **Оборачивайте async функции в `void` при вызове**
   ```typescript
   void fetchData(); // ← Явно игнорируем promise
   ```

---

### ❌ DON'T:

1. **Не используйте `useRef` для защиты от дублирования**
   ```typescript
   // ❌ Не работает в Strict Mode
   const hasRun = useRef(false);
   if (hasRun.current) return;
   ```

2. **Не игнорируйте ошибки отмены**
   ```typescript
   // ❌ Плохо
   catch (error) {
     console.error(error); // Логирует AbortError
   }

   // ✅ Хорошо
   catch (error) {
     if (controller.signal.aborted) return;
     console.error(error);
   }
   ```

3. **Не отключайте Strict Mode**
   ```typescript
   // ❌ Никогда не делайте так
   reactStrictMode: false
   ```

---

## Тестирование

### Как проверить, что дублирование исправлено:

1. **Откройте DevTools → Network tab**
2. **Перейдите на страницу с side-effect**
3. **Проверьте, что запрос выполняется только один раз**

### Как симулировать Strict Mode в production:

```typescript
// Временно включите Strict Mode вручную
import { StrictMode } from 'react';

export default function RootLayout({ children }) {
  return (
    <StrictMode>
      <html>
        <body>{children}</body>
      </html>
    </StrictMode>
  );
}
```

---

## Дополнительные ресурсы

- [React Docs: Strict Mode](https://react.dev/reference/react/StrictMode)
- [React 18: Automatic Batching](https://react.dev/blog/2022/03/29/react-v18#new-strict-mode-behaviors)
- [AbortController MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Next.js: Strict Mode](https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode)

---

## Checklist для новых компонентов

- [ ] `useEffect` с fetch использует `AbortController`
- [ ] Критичные операции защищены флагом `isExecuted`
- [ ] Cleanup функция корректно отменяет side-effects
- [ ] Проверено в dev-режиме (Network tab показывает 1 запрос)
- [ ] Ошибки `AbortError` обрабатываются отдельно

