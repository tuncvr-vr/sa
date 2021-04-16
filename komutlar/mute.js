const Discord = require('discord.js');
const db = require('quick.db');
const ms = require('ms');
const moment = require('moment')
moment.locale("tr");   
    
exports.run = async (client, message, args) => {
let süre = args[1]
let sebep = args[2]
if (!message.member.permissions.has("ADMINISTRATOR")) {
const embed = new Discord.MessageEmbed()
.setTitle(`Rol Hatası`)
.setColor('#000001')
.setDescription(`Maalesef Yetkin Yetersiz !`)
message.channel.send(embed).then(a => a.delete({timeout: 10000}))
return
}
  
let kullanıcı = message.mentions.members.first() || message.guild.members.cache.get(args[0])
if(!kullanıcı) return message.channel.send(new Discord.MessageEmbed().setDescription(`Susturacağın kullanıyı belirtmelisin.`)).then(a => a.delete({timeout: 10000}))
if(message.author.id === kullanıcı.id) return message.channel.send(new Discord.MessageEmbed().setDescription(`Kendini Susturamazsın !`)).then(a => a.delete({timeout: 10000}))
if(kullanıcı.permissions.has('ADMINISTRATOR')) return message.channel.send(new Discord.MessageEmbed().setDescription(`Yetkileri Susturamam.`)).then(a => a.delete({timeout: 10000}))
if(!isNaN(süre)) return message.channel.send(new Discord.MessageEmbed().setDescription(`**Süre** belirtmesiniz! \`1s & 1m & 1h & 1d\``)).then(a => a.delete({timeout: 10000}))
  //Yankee HMMMMMM
message.guild.channels.cache.filter(a => a.type === 'text').forEach(s => {
s.overwritePermissions([{ id: kullanıcı.id, deny: ['SEND_MESSAGES','ADD_REACTIONS'] }]);
})
//Yankee HMMMMMM
message.guild.channels.cache.filter(a => a.type === 'voice').forEach(s => {
s.overwritePermissions([{ id: kullanıcı.id, deny: ['CONNECT'] }]);
});
  
message.channel.send(new Discord.MessageEmbed().setDescription(`**${kullanıcı.user.username} kullanıcısı susturuldu!**
• **Sebep:** \`${sebep || "Neden Belirtilmemiş"}\`
• **Mute Süresi:** \`${ms(ms(süre))}\`
• **Mute'lenme Saati:** \`${moment().add(3, 'hour').format('dddd Do MMMM YYYY h:mm')}\``));
  //Yankee HMMMMMM
setTimeout(function() {
message.guild.channels.cache.filter(a => a.type === 'text').forEach(s => {
s.overwritePermissions([{ id: kullanıcı.id, null: ['SEND_MESSAGES','ADD_REACTIONS'] }])
})
//Yankee HMMMMMM
message.guild.channels.cache.filter(a => a.type === 'voice').forEach(s => {
s.overwritePermissions([{ id: kullanıcı.id, null: ['CONNECT'] }])
})
message.channel.send(new Discord.MessageEmbed()
.setDescription(`${kullanıcı.user.username} **adlı kullanıcının mute süresi bitti!**`))
}, ms(süre))}
exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0
}
exports.help = {
  name: 'mute'
};