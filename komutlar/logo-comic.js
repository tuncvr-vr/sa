const Discord = require('discord.js');
exports.run = (client, message, args) => {
 if (!message.guild) {
    const ozelmesajuyari = new Discord.MessageEmbed()
    .setColor(0xFF0000)
    .setTimestamp()
    .setAuthor(message.author.username, message.author.avatarURL)
    .addField('**Komutları Özel Mesajlarda Kullanılamaz!**')
    return message.author.send(ozelmesajuyari); }
  let isim = args.slice(0).join("+")
  if(!isim)return message.channel.send("**Lütfen Bişey Yaz**")
let link = "https://dynamic.brandcrowd.com/asset/logo/a88088f5-1782-4ebe-b8cb-e69645c2c873/logo?v=4&text="+isim
  const CrewCodeembed = new Discord.MessageEmbed()
  .setColor("BLUE")
  .setImage(link)
  message.channel.send(CrewCodeembed)
};
exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  kategori: 'logolar',
  permLevel: 0
};
exports.help = {
  name: 'comic',
  description: 'Logo Yaparsınız',
  usage: ''
};