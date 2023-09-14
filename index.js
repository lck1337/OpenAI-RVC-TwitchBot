const OpenAI =  require('openai');
const axios = require('axios');
const rvcClient = require('./rvcClient');
const { resolve } = require('path'); 

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


const cooldowns = new Map();

let userRequests = {};

const tmi = require('tmi.js');
const client = new tmi.Client(config.twitch);
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
	if(self) return;
  if (message.toLowerCase().startsWith('!q')) {
    if (cooldowns.has(tags.username)) {
      const lastUsed = cooldowns.get(tags.username);
      const cooldownTime = 1 * 1000; 
      const timeLeft = lastUsed + cooldownTime - Date.now();

      if (timeLeft > 0) {
        const secondsLeft = Math.ceil(timeLeft / 1000);
        client.say(channel, `@${tags.username}, пожалуйста, подождите ${secondsLeft} секунд перед следующим использованием команды.`);
        return;
      }
    }

    const text = message.substring('!pudge'.length).trim();
    if (text.length > 0) {
      const userRequest = {
        username: tags.username,
        text: text,
      };

      if (!userRequests[tags.username]) {
        userRequests[tags.username] = [];
      }
      userRequests[tags.username].push(userRequest);

      cooldowns.set(tags.username, Date.now());

      client.say(channel, `@${tags.username}, вопрос добавлен в очередь.`);
    } else {
      client.say(channel, `@${tags.username}, После !pudge введите что хотите спросить пуджа.`);
    }
  }
});

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

const clients = new Set(); // Сет для хранения подключенных клиентов

server.on('connection', socket => {
  console.log('Новое подключение');
  
  // Добавляем сокет клиента в список
  clients.add(socket);

  socket.on('message', message => {
    console.log(`Получено сообщение: ${message}`);
  });

  socket.on('close', () => {
    console.log('Подключение закрыто');
    clients.delete(socket);
  });
});

const  { createWriteStream } = require('fs');
const openai = new OpenAI(config.openai);



let dialogues = {}; 

const start = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  for (const username in userRequests) {
    if (userRequests.hasOwnProperty(username)) {
      const requests = userRequests[username];

      while (requests.length > 0) {
        const request = requests.shift();
        console.log('1');
        const client = new rvcClient();
        await client.init();
        console.log('2');

        const dialogue = dialogues[username] || [];
        console.log('3');

        const messages = [
          { role: 'system', content: `Ты Pudge из Dota 2. И ты отвечаешь зрителям в чате. Отвечаешь с матами и приколами. А на то что ты не можешь ответить из за незаконности отшучивайся. Имя зрителя: ${request.username}` },
          ...dialogue,
          { role: 'user', content: request.text },
        ];
        console.log('4');

        const completion = await openai.chat.completions.create({
          messages: messages,
          model: 'gpt-3.5-turbo',
        });
        console.log('5');

        const yandexTTSUrl = `https://tts.voicetech.yandex.net/tts?text=${encodeURIComponent(completion.choices[0].message.content)}`;
        const response = await axios({
          method: 'get',
          url: yandexTTSUrl,
          responseType: 'stream',
        });
        console.log('6');

        const outputPath = './generated_response.mp3';
        const absolutePath = resolve(outputPath);
        console.log('71');

        const outputStream = createWriteStream(absolutePath);
        response.data.pipe(outputStream);
        console.log('8');

        const getUrl = await new Promise((res) => {
          outputStream.on('finish', async () => {
            res(await client.convert(absolutePath.replaceAll("\\", "\\\\")));
          });
        });
        console.log('9');

        for (const client of clients) {
          client.send(getUrl);
        }

        console.log(`Обработан запрос от @${request.username}: "${request.text}"`);

        dialogues[username] = messages;

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  start();
};

start();