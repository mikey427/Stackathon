module.exports = {
  name: 'skip',
  description: 'Skip the current song',
  execute (message, args) {
    console.log(args.serverQueue, 'args.serverqueue');
    if (!message.member.voice.channel)
      return message.channel.send(
        'You have to be in the voice channel to skip the song!'
      );
    if (!args.serverQueue)
      return message.channel.send('There is no music playing to skip!');
    message.client.connection.dispatcher.end();
  }
};
