const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
  name: 'play',
  description: 'Plays the song you entered!',
  async execute (message, args) {
    let serverQueue = message.client.serverQueue;
    console.log(serverQueue);
    let songSearch = '';
    for (let i = 0; i <= args.length - 1; i++) {
      songSearch = songSearch + ' ' + args[i];
    }
    let video = await yts(songSearch);
    const song = video.all[0];
    if (!Object.keys(message.client.serverQueue).length) {
      const queueContract = {
        textChannel: message.channel,
        voiceChannel: message.member.voice.channel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
      serverQueue = queueContract;
      serverQueue.songs.push(song);
      try {
        let connection = await message.member.voice.channel.join();
        serverQueue.connection = connection;
        function play (guild, song) {
          if (!song) {
            serverQueue.voiceChannel.leave();
            message.client.serverQueue = {};
            return;
          }
          const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on('finish', () => {
              serverQueue.songs.shift();
              play(guild, serverQueue.songs[0]);
            })
            .on('error', error => console.log(error));
          serverQueue.textChannel.send(`Now playing: ${song.title}`);
          serverQueue.connection.dispatcher = dispatcher;
        }
        play(message.guild.id, serverQueue.songs[0]);
      } catch (error) {
        console.log(error);
        message.client.serverQueue = {};
        return message.channel.send(error);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
    message.client.serverQueue = serverQueue;
    return message.client.serverQueue;
  }
};
