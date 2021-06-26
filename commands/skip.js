module.exports = {
  name: 'skip',
  description: 'Skip the current song',
  execute (message, args) {
    let serverQueue = message.client.serverQueue;
    console.log(serverQueue);
    console.log(message);
    if (!message.member.voice.channel)
      return message.channel.send(
        'You have to be in the voice channel to skip the song!'
      );
    if (!serverQueue)
      return message.channel.send('There is no music playing to skip!');
    message.client.message.serverQueue.connection.dispatcher.end();
  }
};
