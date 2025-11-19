# 🔧 Google Search Console API Setup Guide

## Стъпка 1: Отвори Google Cloud Console

1. Отвори: https://console.cloud.google.com/
2. Влез с твоя Google account (който имаш достъп до testograph.eu в Search Console)

---

## Стъпка 2: Създай нов проект

1. **Кликни на project dropdown** (горе вляво до "Google Cloud")
2. **Кликни "NEW PROJECT"** (горе вдясно на диалога)
3. **Попълни:**
   - Project name: `Testograph SEO`
   - Organization: остави празно
4. **Кликни "CREATE"**
5. **Изчакай** 10-20 секунди за създаване

---

## Стъпка 3: Enable Search Console API

1. **Кликни на навигационното меню** (3 линии горе вляво)
2. **Избери:** `APIs & Services` → `Library`
3. **Търси:** `Search Console API`
4. **Кликни на:** `Google Search Console API`
5. **Кликни "ENABLE"**
6. **Изчакай** да се активира (5-10 секунди)

---

## Стъпка 4: Настрой OAuth Consent Screen

1. **Кликни на навигационното меню** (3 линии горе вляво)
2. **Избери:** `APIs & Services` → `OAuth consent screen`
3. **User Type:** Избери `External`
4. **Кликни "CREATE"**

### Попълни формата:

**OAuth consent screen:**
- App name: `Testograph Admin`
- User support email: `{твоя имейл}`
- App logo: остави празно
- App domain: остави празно
- Authorized domains: остави празно
- Developer contact: `{твоя имейл}`

**Кликни "SAVE AND CONTINUE"**

**Scopes:**
- Кликни "ADD OR REMOVE SCOPES"
- Търси: `webmasters`
- Отметни: `https://www.googleapis.com/auth/webmasters.readonly`
- Кликни "UPDATE"
- Кликни "SAVE AND CONTINUE"

**Test users:**
- Кликни "+ ADD USERS"
- Въведи твоя имейл (същия с който влизаш в Search Console)
- Кликни "ADD"
- Кликни "SAVE AND CONTINUE"

**Summary:**
- Прегледай и кликни "BACK TO DASHBOARD"

---

## Стъпка 5: Създай OAuth 2.0 Credentials

1. **Кликни на навигационното меню** (3 линии горе вляво)
2. **Избери:** `APIs & Services` → `Credentials`
3. **Кликни "+ CREATE CREDENTIALS"** (горе)
4. **Избери:** `OAuth client ID`

### Попълни формата:

- **Application type:** `Web application`
- **Name:** `Testograph Admin`

**Authorized redirect URIs:**
Кликни "+ ADD URI" 2 пъти и добави:

```
http://localhost:3000/api/admin/gsc/callback
```

```
https://testograph.eu/api/admin/gsc/callback
```

**Кликни "CREATE"**

---

## Стъпка 6: Copy Credentials

Ще се появи popup с:
- ✅ **Client ID** (започва с нещо като: 123456789-abc123.apps.googleusercontent.com)
- ✅ **Client secret** (някакъв random string)

**ВАЖНО:**
1. Copy и двете стойности
2. Изпрати ми ги тук в чата (или запиши ги временно в Notepad)

---

## ✅ Готово!

След като ми дадеш Client ID и Client Secret, ще ги добавя в `.env.local` и ще довършим интеграцията!

---

## ❓ Проблеми?

Ако имаш въпроси на който и да е етап:
- Прати screenshot
- Питай ме
- Продължаваме заедно!
