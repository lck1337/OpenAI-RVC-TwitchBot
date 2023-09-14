# OpenAI-RVC-TwitchBot

Бот для твича который отвечает зрителям на их вопросы а так же общается с помощью OpenAI. Текст озвучивается в помощью yandex tts, потом этот озвученный текст прогоняется через RVC и уже файл выдается по вебсокету подключенным клиентам.

## Установка
Node.js должен быть версии 18.15.0 или выше

Устанавливаем зависимости и запускаем

```sh
cd OpenAI-RVC-TwitchBot
npm i
node index.js
```

 - Конфиг меняется в файле index.js в начале файла.
 ```js
 const config = {
  twitch: {
    options: { debug: true },
    identity: {
      username: '<username>', // Юзернейм
      password: '<token>' // OAuth
    },
    channels: [ '<channel>' ] // Каналы в каоторые зайдет бот
  },
  openai: {
    apiKey: '<openai_key>', // Ваш ключ openai
  }
}
```
 - У вас должен быть установлен и запущен RVC 
    https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
 - В моем коде я использую свою модель и свои запросы для RVC, вы же можете их поменять в файле rvcClient.js, что-бы посмореть какие запросы откройте devtools и перейдите во вкладку network и там при выборе модели вы увидите запрос
[![RVC](https://github.com/lck1337/OpenAI-RVC-TwitchBot/blob/main/media/rvc.jpg?raw=true)](https://github.com/lck1337/OpenAI-RVC-TwitchBot/blob/main/media/rvc.jpg?raw=true)
 - Токен для авторизаций с твича вы так же достаете из запроса
 [![Twitch](https://github.com/lck1337/OpenAI-RVC-TwitchBot/blob/main/media/token.jpg?raw=true)](https://github.com/lck1337/OpenAI-RVC-TwitchBot/blob/main/media/token.jpg?raw=true)

## Видосик
[![Видосик](https://github.com/lck1337/OpenAI-RVC-TwitchBot/blob/main/media/previe.jpg?raw=true)](https://raw.githubusercontent.com/lck1337/OpenAI-RVC-TwitchBot/main/media/video.mp4)

