const { Client, Collection } = require('discord.js');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');
const { Readable } = require('stream');
const queue = new Map();
const prefix = process.env.prefix;

const client = new Client();
client.commands = new Collection();
const serverID = 857733553797726249;
// console.log(queue);
let serverQueue = queue.get(serverID);
// console.log(serverQueue, 'serverqueue');

const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // set a new item in the Collection
  // with the key as the command name and the value as the export module
  client.commands.set(command.name, command);
}

const eventFiles = fs
  .readdirSync('./events')
  .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// client.on('message', async message => {
//   if (message.author.bot) return;
//   if (!message.content.startsWith(prefix)) return;

// const serverQueue = queue.get(message.guild.id);

//   if (message.content.startsWith(`${prefix}play`)) {
//     execute(message, serverQueue);
//     return;
//   } else if (message.content.startsWith(`${prefix}skip`)) {
//     skip(message, serverQueue);
//     return;
//   } else if (message.content.startsWith(`${prefix}stop`)) {
//     stop(message, serverQueue);
//     return;
//   } else if (message.content.startsWith(`${prefix}listen`)) {
//     listen(message);
//   } else {
//     message.channel.send('You need to enter a valid command!');
//   }
// });

client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  console.log(serverQueue, 'servQueue in main');
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/);
  args.serverQueue = serverQueue;
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  try {
    serverQueue = await client.commands.get(command).execute(message, args);
    // console.log(args.serverQueue, 'serverQueue after play');
    // console.log(queue, 'queue after play');
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

// const execute = async (message, serverQueue) => {
//   const args = message.content.split(' ');
//   const voiceChannel = message.member.voice.channel;
//   if (!voiceChannel) {
//     return message.channel.send(
//       'You need to be in a voice channel to play music!'
//     );
//   }
//   const permissions = voiceChannel.permissionsFor(message.client.user);
//   if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
//     return message.channel.send(
//       'I need the permissions to join and speak in your voice channel!'
//     );
//   }
//   let songSearch = '';
//   for (let i = 1; i < args.length; i++) {
//     songSearch = songSearch + ' ' + args[i];
//   }
//   let video = await yts(songSearch);
//   // console.log(songSearch, video.all[0].url, 'song search and video');
//   const song = video.all[0];
//   // console.log(song);
//   if (!serverQueue) {
//     const queueContract = {
//       textChannel: message.channel,
//       voiceChannel: voiceChannel,
//       connection: null,
//       songs: [],
//       volume: 5,
//       playing: true
//     };
//     queue.set(message.guild.id, queueContract);
//     queueContract.songs.push(song);
//     try {
//       let connection = await voiceChannel.join();
//       queueContract.connection = connection;
//       play(message.guild, queueContract.songs[0]);
//     } catch (error) {
//       console.log(error);
//       queue.delete(message.guild.id);
//       return message.channel.send(error);
//     }
//   } else {
//     serverQueue.songs.push(song);
//     return message.channel.send(`${song.title} has been added to the queue!`);
//   }
// };

// const play = async (guild, song) => {
//   const serverQueue = queue.get(guild.id);
//   if (!song) {
//     serverQueue.voiceChannel.leave();
//     queue.delete(guild.id);
//     return;
//   }
//   const dispatcher = serverQueue.connection
//     .play(ytdl(song.url))
//     .on('finish', () => {
//       serverQueue.songs.shift();
//       play(guild, serverQueue.songs[0]);
//     })
//     .on('error', error => console.log(error));
//   // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
//   serverQueue.textChannel.send(`Now playing: ${song.title}`);
// };

// const skip = async (message, serverQueue) => {
//   if (!message.member.voice.channel)
//     return message.channel.send(
//       'You have to be in the voice channel to stop the music!'
//     );
//   if (!serverQueue)
//     return message.channel.send('There is no music playing to skip!');
//   serverQueue.connection.dispatcher.end();
// };

const stop = async (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      'You have to be in the voice channel to stop the music!'
    );
  if (!serverQueue) return message.channel.send('There is no music to stop!');
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

const listen = async message => {
  const user = message.member;
  const voiceChannel = user.voice.channel;
  let connection = await voiceChannel.join();
  message.channel.send('Listening!');
  let active = false;
  // console.log(connection.voice.channel.members, 'connection');
  // client.on(connection.voice.channel.members);
  console.log(user.voice.channel.members.prototype);
  console.log(client);
  // console.log(user);
  // console.log(user.user.Speaking, 'true');
  client.on('');
  while (active) {
    if (user.speaking) {
      const audio = connection.receiver.createStream(message, {
        mode: opus,
        end: manual
      });
      audio.pipe(fs.createWriteStream('user_audio'));
      const dispatcher = connection.play(audio);
    } else {
      console.log(user.user.Speaking, 'false');
    }
  }
};

client.login(process.env.DISCORDJS_BOT_TOKEN);
