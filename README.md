## Как запустить

```bash
npm install
npm run dev
```

Откройте адрес, который выведет Vite (обычно `http://localhost:5173`).

## Как пользоваться

1. В кабинете [GREEN-API Telegram](https://green-api.com/telegram/) возьмите `idInstance` и `apiTokenInstance`.
2. Введите их на экране входа. Поле `apiUrl` подставится само.
3. Если статус инстанса «Неавторизован», отсканируйте QR-код в Telegram: **Настройки → Устройства → Подключить устройство**.
4. Укажите номер получателя в международном формате (`79991234567`) или `@username` и создайте чат.
5. Отправьте текстовое сообщение. Когда собеседник ответит в Telegram, ответ появится в этом чате.

## API

Документация Telegram GREEN-API:

- [SendMessage](https://green-api.com/en/telegram/docs/api/sending/SendMessage/)
- [ReceiveNotification](https://green-api.com/en/telegram/docs/api/receiving/technology-http-api/ReceiveNotification/)
- [DeleteNotification](https://green-api.com/en/telegram/docs/api/receiving/technology-http-api/DeleteNotification/)
- [CheckAccount](https://green-api.com/en/telegram/docs/api/service/CheckAccount/)
