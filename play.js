const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
  name: 'play',
  description: 'Plays the song you entered!',
  async execute (message, args) {
    let queue = message.client.queue;
    let serverQueue = args.serverQueue;
    let songSearch = '';
    // console.log(args, args.length);
    for (let i = 0; i <= args.length - 1; i++) {
      songSearch = songSearch + ' ' + args[i];
    }
    // console.log(songSearch);
    let video = await yts(songSearch);
    // console.log(songSearch, video.all[0].url, 'song search and video');
    const song = video.all[0];
    // console.log(song);
    if (!serverQueue) {
      const queueContract = {
        textChannel: message.channel,
        voiceChannel: message.member.voice.channel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
      queue.set(message.guild.id, queueContract);
      // console.log(queue.get(message.guild.id).songs, 'id');
      queue.get(message.guild.id).songs.push(song);
      // console.log(queue.get(message.guild.id).songs, 'id2');
      try {
        let connection = await queueContract.voiceChannel.join();
        queueContract.connection = connection;
        message.client.connection = connection;
        function play (guild, song) {
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
          // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
          serverQueue.textChannel.send(`Now playing: ${song.title}`);
          // queue.get(message.guild.id).connection.dispatcher = dispatcher;
          message.client.connection.dispatcher = dispatcher;
        }
        play(message.guild, queueContract.songs[0]);
      } catch (error) {
        console.log(error);
        queue.delete(message.guild.id);
        return message.channel.send(error);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
    // console.log(queue, 'queue');
    // console.log(serverQueue, 'serverqueue');
    return queue.get(message.guild.id);
  }
};
//queue and serverQueue => ISSUE
