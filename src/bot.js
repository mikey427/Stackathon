const { Client } = require('discord.js');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

const client = new Client();
const queue = new Map();
const prefix = process.env.prefix;

client.on('ready', () => {
  console.log('The bot has logged in...');
});

client.once('ready', () => {
  console.log('Ready!');
});
client.once('reconnecting', () => {
  console.log('Reconnecting!');
});
client.once('disconnect', () => {
  console.log('Disconnected!');
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else {
    message.channel.send('You need to enter a valid command!');
  }
});

const execute = async (message, serverQueue) => {
  const args = message.content.split(' ');
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      'You need to be in a voice channel to play music!'
    );
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNET') || !permissions.has('SPEAK')) {
    return message.channel.send(
      'I need the permissions to join and speak in your voice channel!'
    );
  }
  let songSearch = '';
  for (let i = 1; i < args.length; i++) {
    songSearch = songSearch + ' ' + args[i];
  }
  let video = await yts(songSearch);
  // console.log(songSearch, video.all[0].url, 'song search and video');
  const song = video.all[0];
  // console.log(song);
  if (!serverQueue) {
    const queueContract = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(message.guild.id, queueContract);
    queueContract.songs.push(song);
    try {
      let connection = await voiceChannel.join();
      queueContract.connection = connection;
      play(message.guild, queueContract.songs[0]);
    } catch (error) {
      console.log(error);
      queue.delete(message.guild.id);
      return message.channel.send(error);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
};

const play = async (guild, song) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on('finish', () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => console.log(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Now playing: ${song.title}`);
};

const skip = async (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      'You have to be in the voice channel to stop the music!'
    );
  if (!serverQueue)
    return message.channel.send('There is no music playing to skip!');
  serverQueue.connection.dispatcher.end();
};

const stop = async (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      'You have to be in the voice channel to stop the music!'
    );
  if (!serverQueue) return message.channel.send('There is no music to stop!');
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};
client.login(process.env.DISCORDJS_BOT_TOKEN);
