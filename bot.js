const fs=require('fs');
const Discord=require("discord.js");
const client=new Discord.Client();
const db = require('quick.db')
const chalk = require("chalk");
const moment = require("moment");
const ayarlar=require("./ayarlar.json");
const express = require('express');
/////
const app = express()
app.get('/', (req, res) => res.send("Bot Aktif | Discord = https://discord.gg/XTsKVQSgpG"))
app.listen(process.env.PORT, () => console.log('Port ayarlandı: ' + process.env.PORT))
//////////////////

client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
     cmd.run(client, message, params, perms);
  }
})



const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

  
client.yetkiler = message => {
  if(!message.guild) {
	return; }
  let permlvl = -ayarlar.varsayilanperm  ;
  if(message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if(message.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
  if(message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
  if(message.member.hasPermission("MANAGE_GUILD")) permlvl = 4;
  if(message.member.hasPermission("ADMINISTRATOR")) permlvl = 5;
  if(message.author.id === message.guild.ownerID) permlvl = 6;
  if(message.author.id === ayarlar.sahip) permlvl = 7;
  return permlvl;
};


///////////////////////////////KOMUTLAR//////////////////////////////

client.on("message", async message => {
    if(message.author.bot) return;
    
    let i = await db.fetch(`reklamFiltre_${message.guild.id}`)  
          if (i == 'acik') {
              const reklam = ["https://","http://","discord.gg",
      "discord.gg",
      ".com",
      ".net",
      ".xyz",
      ".tk",
      ".pw",
      ".io",
      ".me",
      ".gg",
      "www.",
      "https",
      "http",
      ".gl",
      ".org",
      ".com.tr",
      ".biz",
      ".party",
      ".rf.gd",
      ".az"]
              if (reklam.some(word => message.content.toLowerCase().includes(word))) {
                try {
                  if (!message.member.hasPermission("MANAGE_GUILD")) {
                    message.delete();                                       
                    return message.channel.send(`<@${message.author.id}> Reklam Yapmak Yasak!`).then(message => message.delete(10000));
                  }              
                } catch(err) {
                  console.log(err);
                }
              }
          }
          if (!i) return;
          });    

///////////////////////////////////////////////////////////////////////////////////////////////
client.on("message", async msg => {
  
  
  let a = await db.fetch(`kufur_${msg.guild.id}`)
    if (a == 'acik') {
      const küfür = [
        "yarak","mk", "amk", "aq", "orospu", "oruspu", "oç", "sikerim", "yarrak", "piç", "amq", "sik", "amcık", "çocu", "sex", "seks", "amına", "orospu çocuğu", "sg", "siktir git","31","ananın amına yarak"
                  ]
            if (küfür.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.hasPermission("MANAGE_GUILD")) {
                  msg.delete();
                          
                    return msg.channel.send(`Küfür etme Yasak az kaldı ban atmama!`).then(msg => msg.delete(10000));
            }              
                } catch(err) {
                  console.log(err);
                }
              }
          }
          if (!a) return;
          })

/////////////////////////////////////////////////////////////////////////////////////////////
client.on("message", async message => {
  if (message.author.bot || message.channel.type === "dm") return;

  var afklar = await db.fetch(`afk_${message.author.id}, ${message.guild.id}`);

  if (afklar) {
    db.delete(`afk_${message.author.id}, ${message.guild.id}`);
    db.delete(`afk-zaman_${message.author.id}, ${message.guild.id}`);

    message.reply(`Afklıktan Çıktın!`)
    try {
      let isim = message.member.nickname.replace("[AFK]", "");
      message.member.setNickname(isim).catch(err => console.log(err));
    } catch (err) {
      console.log(err.message);
    }
  }
  let ms = require("ms");

  var kullanıcı = message.mentions.users.first();
  if (!kullanıcı) return;
  let zaman = await db.fetch(`afk-zaman_${kullanıcı.id}, ${message.guild.id}`);

  var süre = ms(new Date().getTime() - zaman);

  var sebep = await db.fetch(`afk_${kullanıcı.id}, ${message.guild.id}`);
  if (
    await db.fetch(
      `afk_${message.mentions.users.first().id}, ${message.guild.id}`
    )
  ) {
    if (süre.days !== 0) {
const dcs = new Discord.MessageEmbed()
.setTitle(":uyarii: Uyarı!")
.setDescription("Etiketlediniz Kullanıcı Afk!")
.addField("Afk Nedeni:",`> ${sebep}`)
.setColor("RANDOM")
.setThumbnail(message.author.avatarURL())
.addField("Afk Olma Süresi",`> ${süre}`);
message.channel.send(dcs)
      return;
    }
  }
});
////////////////////////////////////////////////////////////////////
client.on("message", async msg => {
 
 
  const i = await db.fetch(`ssaass_${msg.guild.id}`);
    if (i == 'acik') {
      if (msg.content.toLowerCase() == 'sa' || msg.content.toLowerCase() == 's.a' || msg.content.toLowerCase() == 'selamun aleyküm' || msg.content.toLowerCase() == 'sea'|| msg.content.toLowerCase() == 'selam') {
          try {
 
                  return msg.reply(
                    'Aleyküm Selam, Hoşgeldin')
          } catch(err) {
            console.log(err);
          }
      }
    }
    else if (i == 'kapali') {
   
    }
    if (!i) return;
 
    });

client.login(process.env.token)

client.on('guildDelete', guild => {

let Crewembed = new Discord.MessageEmbed()

.setColor("RED")
.setTitle(" Bot Bir sunucuda kicklendi,bilgiler;   ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('825703717751881748').send(Crewembed);
  
});


client.on('guildCreate', guild => {

let Crewembed = new Discord.MessageEmbed()

.setColor("GREEN")
.setTitle(" Bot Bir sunucuya eklendi,bilgiler;  ")
.addField("Sunucu Adı:", guild.name)
.addField("Sunucu sahibi", guild.owner)
.addField("Sunucudaki Kişi Sayısı:", guild.memberCount)

   client.channels.cache.get('825703717751881748').send(Crewembed);
  
});


////////////////////////////////////////

client.on('ready', () => {
  setInterval(function() {
     let knl = client.channels.cache.get("776728215480696852")
     if(knl){
knl.send("**Kayıt olmak için** ``-kayıtol <isim> <yaş> `` **şeklinde doldurunuz.**")
     }
    }, 1800000) //1000 = 1 Saniye 1800000
}) 
 //////////////////////////////////////
client.on('ready', () => {
  setInterval(function() {
     let knl = client.channels.cache.get("779613501483515904")
     if(knl){
knl.send("** Abone rölü almak için youTube kanalıma gidip son videoya like,yorum atmanız ve ss alıp buraya atmanız gerekmektedir!**")
     }
    }, 1800000) //1000 = 1 Saniye 1800000
}) 
//////////////////////////


client.on('message', message => {

 if (message.content.toLowerCase() === '<@703985300304822293>') {

 message.delete()

 message.channel.send(message.author+",  **Yapımcımı Etiketleme**").then(message => message.delete(5000))

 

}

});







client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "naber") {
    krevzmesaj.channel.send(
      "iyidir senden naber"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "sunucu link") {
    krevzmesaj.channel.send("`https://discord.gg/mQ4vrkSdvQ`");
  }
});

client.on("message", krevzlinkmsg => {
  if (krevzlinkmsg.content.toLowerCase() === "kumar oynayak mı?") {
    krevzlinkmsg.channel.send(
      "valla ben riske giremem"
    );
  }
});

client.on("message", krevzmsg => {
  if (krevzmsg.content.toLowerCase() === "ağlıyom") {
    krevzmsg.channel.send(
      "nabam aq"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "mutluyum") {
    krevzmesaj.channel.send(
      "keşke mutlu olmak kolay olsa bea"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "napim") {
    krevzmesaj.channel.send(
      "ananun amunu yula"
    );
  }
});


client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "bot çok kötü") {
    krevzmesaj.channel.send(
      "o zaman siktir git ve gelme!"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "selam") {
    krevzmesaj.channel.send(
      "assssssssssssssssssssss"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "oc") {
    krevzmesaj.channel.send(
      "ayıp pezevenk"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "oç") {
    krevzmesaj.channel.send(
      "ayıp pezevenk"
    );
  }
});



client.on('guildCreate', guild => {
    let virus = guild.channels.filter(c => c.type === "text").random()
    virus.send("Dostum beni sunucuna ekledin tşk -yardım yazarak komutları listleyebilirsin");
});



client.on("message", msg => {
var dm = client.channels.cache.get("813134272319586347")
if(msg.channel.type === "dm") {
if(msg.author.id === client.user.id) return;
const botdm = new Discord.MessageEmbed()
.setTitle(`🔔 Yeni Bir Mesajım Var`)
.setTimestamp()
.setColor("RED")
.setThumbnail(`${msg.author.avatarURL()}`)
.addField("Gönderen", msg.author.tag)
.addField("Gönderen ID", msg.author.id)
.addField("Gönderilen Mesaj", msg.content)

dm.send(botdm)

}
if(msg.channel.bot) return;
});




    

 client.on('guildMemberAdd', youthanasia => {
    if (db.has(`isimreklamkoruma.${youthanasia.guild.id}`) && youthanasia.user.username.toLowerCase().replace(/ /g, '').includes('discord.gg')) {
      youthanasia.send('İsminde reklam içerikli bir şey olabileceğinden dolayı seni yasakladım.').catch(err => console.warn('Bir kişiyi reklam içerikli isimden banladım ancak o kişiye mesaj yollayamadım.'));
      youthanasia.ban({ reason: 'Reklam içerikli kullanıcı adı.' });
    };
  });

  client.on('guildMemberUpdate', (rifleman, youthanasia) => {
    if (db.has(`isimreklamkoruma.${youthanasia.guild.id}`) && youthanasia.displayName.toLowerCase().replace(/ /g, '').includes('discord.gg')) {
      youthanasia.send('İsminde reklam içerikli bir şey olabileceğinden dolayı seni yasakladım.').catch(err => console.warn('Bir kişiyi reklam içerikli isimden banladım ancak o kişiye mesaj yollayamadım.'));
      youthanasia.ban({ reason: 'Reklam içerikli kullanıcı adı.' });
    };
  });


function percentage(partialValue, totalValue) {
   return (100 * partialValue) / totalValue;
} 

client.on('message', async(message) => {
if (!message.guild) return
let acikmi = await db.fetch(`${message.guild.id}.capsengel`)
if (!acikmi) return
if (message.author.bot) return
if (message.member.hasPermission("MANAGE_MESSAGES")) return
let matched = message.content.replace(/[^A-Z]/g, "").length
let yuzde = percentage(matched, message.content.length)
if (Math.round(yuzde) > acikmi.yuzde) {
  message.delete()
  message.author.send(new Discord.MessageEmbed().setColor("RED").setTimestamp().setFooter(`${message.guild.name}`,message.guild.iconURL({dynamic:true})).setAuthor("CapsLock Engelleme Sistemi").setDescription("**Uyarı! "+message.guild.name+" sunucusunda büyük harfle yazma engeli bulunmaktadır!**\nBu sebepten göndermiş olduğunuz mesaj silindi."))
  message.channel.send(new Discord.MessageEmbed().setColor("RED").setTimestamp().setFooter(`${message.guild.name}`,message.guild.iconURL({dynamic:true})).setAuthor("CapsLock Engelleme Sistemi",message.author.displayAvatarURL({dynamic:true})).setDescription(message.author.username+" - "+(message.member.nickname ? `${message.member.nickname} - ${message.author.id}` : message.author.id)+"\n**Uyarı!  Bu sunucuda büyük harfle yazma engeli bulunmaktadır!**\nBu sebepten göndermiş olduğunuz mesaj silindi.")).then(msg=>msg.delete({timeout:3000}))
}else{return}
})

client.on('guildMemberAdd', async member => {// can#0002

  const database = require('quick.db');
  if(member.user.bot) return;
  
  const kanal = member.guild.channels.cache.get(await database.fetch(`fake-channel.${member.guild.id}`) || 0);
  const zaman = await database.fetch(`fake-time.${member.guild.id}`);
  const rol = member.guild.roles.cache.get(await database.fetch(`fake-role.${member.guild.id}`) || 0);
  if(!kanal || !zaman || !rol) return;

  if(member.user.createdAt.getTime() < require('ms')(zaman)) {

    member.roles.add(rol.id);
    const embed = new Discord.MessageEmbed()
    .setColor('BLUE')
    .setTitle('Fake Tetikleyici')
    .setDescription(`**${member.user.tag}** Fake sistemine takıldı!`);
    return kanal.send(embed);

  } else return;

});// codare 





client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "napom") {
    krevzmesaj.channel.send(
      "Görmedim zanetme"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "npm i") {
    krevzmesaj.channel.send(
      "ayn knk şu anda bütün modüller indi"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "@812217484970557451") {
    krevzmesaj.channel.send(
      "Buyrun benim"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "812217484970557451") {
    krevzmesaj.channel.send(
      "Buyrun benim"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "KMD") {
    krevzmesaj.channel.send(
      "Buyrun benim"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "Koyuncu Mustafa Dayı") {
    krevzmesaj.channel.send(
      "Buyrun benim"
    );
  }
});

client.on("message", krevzmesaj => {
  if (krevzmesaj.content.toLowerCase() === "@Koyuncu Mustafa Dayı") {
    krevzmesaj.channel.send(
      "Buyrun benim"
    );
  }
});

 




const emmmmbed = new Discord.MessageEmbed()
.setThumbnail()
.addField(`Hey ! | Teşekkürler`, `**Görünüşe göre beni eklemişsiniz size teşekkür ederim **`)
.addField( `Prefix`, `**Koyuncu Mustafa Dayının  Prefixi(ön eki) = \`${ayarlar.prefix}\`\n\n **`)
.addField(`KMD (koyuncu mustafa dayı)| Nasıl Kullanılır?`, `**KMD botunun tüm özelliklerinden yararlanabilmek için sadece \`${ayarlar.prefix}yardım\` yazmanız yeterlidir.**`)
.addField(`KMD | Linkler`, `**Sohbet Kanalına -davet Yazmanız Yeterlidir**`)
.setFooter(`Ultra gelişmiş türk yapımı bot !! 100 sunucu olursak bot ingilizce olacak`)
.setTimestamp();


client.on("guildCreate", guild => {

let defaultChannel = "";
guild.channels.cache.forEach((channel) => {
if(channel.type == "text" && defaultChannel == "") {
if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
defaultChannel = channel;
}
}
})

defaultChannel.send(emmmmbed)

});




client.on("roleDelete", async role => {
  let rolko = await db.fetch(`rolk_${role.guild.id}`);
  if (rolko) { 
         const entry = await role.guild.fetchAuditLogs({ type: "ROLE_DELETE" }).then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
  role.guild.roles.create({ data: {
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          permissions: role.permissions,
          mentionable: role.mentionable,
          position: role.position
}, reason: 'Silinen Roller Tekrar Açıldı.'})
  }
})

//

client.on("roleCreate", async role => {
  let rolk = await db.fetch(`rolk_${role.guild.id}`);
  if (rolk) { 
       const entry = await role.guild.fetchAuditLogs({ type: "ROLE_CREATE" }).then(audit => audit.entries.first());
    if (entry.executor.id == client.user.id) return;
  role.delete()
  }
})

//

client.on("channelDelete", async function(channel) {
    let rol = await db.fetch(`kanalk_${channel.guild.id}`);
  
  if (rol) {
const guild = channel.guild.cache;
let channelp = channel.parentID;

  channel.clone().then(z => {
    let kanal = z.guild.channels.find(c => c.name === z.name);
    kanal.setParent(
      kanal.guild.channels.find(channel => channel.id === channelp)
      
    );
  });
  }
})

//

client.on("emojiDelete", async (emoji, message, channels) => {
  let emojik = await db.fetch(`emojik_${emoji.guild.id}`)
  if (emojik) {
  const entry = await emoji.guild.fetchAuditLogs({ type: "EMOJI_DELETE" }).then(audit => audit.entries.first());
  if (entry.executor.id == client.user.id) return;
  if (entry.executor.id == emoji.guild.owner.id) return;
  if (!emoji.guild.members.cache.get(entry.executor.id).hasPermission('ADMINISTRATOR')) {
    
  emoji.guild.emojis.create(`${emoji.url}`, `${emoji.name}`).catch(console.error);

  
  }
  }
});



client.on('channelCreate', async channel => {
  const c = channel.guild.channels.cache.get(db.fetch(`nordxmodlog${channel.guild.id}`));
  if (!c) return;
    var embed = new Discord.MessageEmbed()
                    .addField(`Kanal oluşturuldu`, `Kanal İsmi: \`${channel.name}\`\n Kanal Türü: **${channel.type}**\nKanal ID: ${channel.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${channel.client.user.username}#${channel.client.user.discriminator}`, channel.client.user.avatarURL)
    c.send(embed)
});

client.on('channelDelete', async channel => {
  const c = channel.guild.channels.cache.get(db.fetch(`nordxmodlog${channel.guild.id}`));
  if (!c) return;
    let embed = new Discord.MessageEmbed()
                    .addField(`Kanal silindi`, `Silinen Kanal İsmi: \`${channel.name}\`\nSilinen Kanal Türü: **${channel.type}**\nSilinen Kanal ID: ${channel.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${channel.client.user.username}#${channel.client.user.discriminator}`, channel.client.user.avatarURL)

    c.send(embed)
});

   client.on('channelNameUpdate', async channel => {
  const c = channel.guild.channels.cache.get(db.fetch(`nordxmodlog${channel.guild.id}`));
  if (!c) return;
    var embed = new Discord.MessageEmbed()
                    .addField(`Kanal İsmi değiştirildi`, ` Yeni İsmi: \`${channel.name}\`\nKanal ID: ${channel.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${channel.client.user.username}#${channel.client.user.discriminator}`, channel.client.user.avatarURL)
    c.send(embed)
});




client.on('emojiCreate', emoji => {
  const c = emoji.guild.channels.cache.get(db.fetch(`nordxmodlog${emoji.guild.id}`));
  if (!c) return;

    let embed = new Discord.MessageEmbed()
                    .addField(`Emoji oluşturuldu`, ` İsmi: \`${emoji.name}\`\n Gif?: **${emoji.animated}**\nEmoji ID: ${emoji.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${emoji.client.user.username}#${emoji.client.user.discriminator}`, emoji.client.user.avatarURL)

    c.send(embed)
    });
client.on('emojiDelete', emoji => {
  const c = emoji.guild.channels.cache.get(db.fetch(`nordxmodlog${emoji.guild.id}`));
  if (!c) return;

    let embed = new Discord.MessageEmbed()
                    .addField(`Emoji silindi`, ` İsmi: \`${emoji.name}\`\n Gif? : **${emoji.animated}**\nSilinen Emoji ID: ${emoji.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${emoji.client.user.username}#${emoji.client.user.discriminator}`, emoji.client.user.avatarURL)
   

    c.send(embed)
    });
client.on('emojiUpdate', (oldEmoji, newEmoji) => {
  const c = newEmoji.guild.channels.cache.get(db.fetch(`nordxmodlog${newEmoji.guild.id}`));
  if (!c) return;

    let embed = new Discord.MessageEmbed()
                    .addField(`Emoji güncellendi`, ` Eski ismi: \`${oldEmoji.name}\`\n Yeni ismi: \`${newEmoji.name}\`\nEmoji ID: ${oldEmoji.id}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${newEmoji.client.user.username}#${newEmoji.client.user.discriminator}`, newEmoji.client.user.avatarURL)

    c.send(embed)
    });

client.on('messageDelete', async message => {    
  if(message.author.bot) return

    const channel = message.guild.channels.cache.get(db.fetch(`nordxmodlog${message.guild.id}`));
  if (!channel) return;
  
    let embed = new Discord.MessageEmbed()
                    .setAuthor(`Silen Kişi: ${message.author.username}#${message.author.discriminator}`, message.author.avatarURL())
                    .setTitle("Mesaj silindi")                
                    .addField(`Silinen mesaj : ${message.content}`,`Silindiği Kanal: ${message.channel.name}`)
                    .setTimestamp()
                    .setColor("RANDOM")
                    .setFooter(`${message.client.user.username}#${message.client.user.discriminator}`, message.client.user.avatarURL)

    channel.send(embed)
});

client.on('messageUpdate', async(oldMessage, newMessage) => {
    if(oldMessage.author.bot) return;
    if(oldMessage.content == newMessage.content) return;

    const channel = oldMessage.guild.channels.cache.get(db.fetch(`nordxmodlog${oldMessage.guild.id}`));
    if(!channel) return;

    let embed = new Discord.MessageEmbed()
    .setTitle("Mesaj güncellendi!")
    .addField("Eski mesaj : ",`${oldMessage.content}`)
    .addField("Yeni mesaj : ",`${newMessage.content}`)
    .addField("Kanal : ",`${oldMessage.channel.name}`)
    .setTimestamp()
    .setColor("RANDOM")
    .setFooter(`${oldMessage.client.user.username}#${oldMessage.client.user.discriminator}`,`${oldMessage.client.user.avatarURL}`)

    channel.send(embed)
});

client.on('roleCreate', async (role) => {    

    const channel = role.guild.channels.cache.get(db.fetch(`nordxmodlog${role.guild.id}`));
  if (!channel) return;
  
    let embed = new Discord.MessageEmbed()
.addField(`Rol oluşturuldu`, `Rol ismi: \`${role.name}\`\nRol ID: ${role.id}`)                    
.setTimestamp()
.setColor("RANDOM")
.addField("Rol renk kodu : ",`${role.hexColor}`)
.setFooter(`${role.client.user.username}#${role.client.user.discriminator}`, role.client.user.avatarURL)

    channel.send(embed)
});

client.on('roleDelete', async (role) => {    

    const channel = role.guild.channels.cache.get(db.fetch(`nordxmodlog${role.guild.id}`));
  if (!channel) return;
  
    let embed = new Discord.MessageEmbed()
.addField(`Rol silindi`, `Silinen Rol ismi: \`${role.name}\`\nSilinen Rol ID: ${role.id}`)                    
.setTimestamp()
.setColor("RANDOM")
    .addField("Rol renk kodu : ",`${role.hexColor}`)
.setFooter(`${role.client.user.username}#${role.client.user.discriminator}`, role.client.user.avatarURL)

    channel.send(embed)
})


  
 




client.on("message", msg => {
 const veri = db.fetch(`${msg.guild.id}.reklam`)
 if (veri) {
        const reklam = [".com", ".net", ".xyz", ".tk", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl", ".org", ".com.tr", ".biz", "net", ".rf.gd", ".az", ".party", "discord.gg", "youtube.com"];
        if (reklam.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.permissions.has("BAN_MEMBERS")) {
                  msg.delete();
                    return msg.reply('Yakaladım Seni! Reklam Yasak.').then(nordx => nordx.delete({timeout: 5000}))                          
            
            }              
          } catch(err) {
            console.log(err);
          }
        }
 }
       if(!veri) return;
    });




client.on("message", async msg => {
 const i = await db.fetch(`${msg.guild.id}.kufur`)
    if (i) {
        const kufur = ["oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];
        if (kufur.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.permissions.has("BAN_MEMBERS")) {
                  msg.delete();
                          
                      return msg.reply('Heey! Küfür Yasak.').then(nordx => nordx.delete({timeout: 5000}))
            }              
          } catch(err) {
            console.log(err);
          }
        }
    }
    if (!i) return;
});

client.on("messageUpdate", async msg => {
 const i = db.fetch(`${msg.guild.id}.kufur`)
    if (i) {
        const kufur = ["oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "am", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];
        if (kufur.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.permissions.has("BAN_MEMBERS")) {
                  msg.delete();
                          
                      return msg.reply('Yakaladım Seni! Küfür Yasak.').then(nordx => nordx.delete({timeout: 5000}))
            }              
          } catch(err) {
            console.log(err);
          }
        }
    }
    if (!i) return;
});


client.on("guildMemberAdd", async member => {
  let hgmesajı = db.fetch(`kgirismesajı_${member.guild.id}`)
  client.channels.cache.get(hgmesajı).send(`Hoşgeldin ${member} Kayıt Olmak İçin !kayıt İsim Yaş`);
});


client.on("guildMemberAdd", async member => {
  let yetkilihgmesajı = db.fetch(`yetkilikgirismesajı_${member.guild.id}`)
  client.channels.cache.get(yetkilihgmesajı).send(`Hoşgeldin ${member} Kayıt Olmak İçin Kayıt Kanalına İsmini Yaz Ve Yetkilileri Bekle!`);
});


client.on("message", async message => {

  if (message.author.bot) return;

  if (!message.guild) return;

  let prefix = db.get(`prefix_${message.guild.id}`);

  if (prefix === null) prefix = prefix;



  if (!message.content.startsWith(prefix)) return;



  if (!message.member)

    message.member = await message.guild.fetchMember(message);



  const args = message.content

    .slice(prefix.length)

    .trim()

    .split(/ +/g);

  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;
  
  let command = client.commands.get(cmd);

  if (!command) command = client.commands.get(client.aliases.get(cmd));

  if (command) command.run(client, message, args);

});


client.on("guildMemberAdd", async member => {
  let kanal1 = await db.fetch(`otorolkanal_${member.guild.id}`);
  let rol1 = await db.fetch(`otorolrol_${member.guild.id}`);

  let kanal = member.guild.channels.cache.get(kanal1);
  let rol = member.guild.roles.cache.get(rol1);

  if (!kanal) return;
  if (!rol) return;

  const embed = new Discord.MessageEmbed()

    .setColor("BLACK")
    .setDescription(
      `Sunucuya Katılan **${member}** Adlı Kullanıcıya Başarıyla \`${rol.name}\` Rolü Verildi.`
    );

  kanal.send(embed);
  member.roles.add(rol);
});









client.on("guildMemberAdd", async member => {
let kanal = await db.fetch(`antiraidK_${member.guild.id}`)== "anti-raid-aç"
  if (!kanal) return;  
  var cod = member.guild.owner
  if (member.user.bot === true) {
     if (db.fetch(`botizin_${member.guild.id}.${member.id}`) == "aktif") {
    let are = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setThumbnail(member.user.avatarURL())
      .setDescription(`**${member.user.tag}** (${member.id}) adlı bota bir yetkili izin verdi eğer kaldırmak istiyorsanız **$bot-izni kaldır botun_id**.`);
    cod.send(are);
     } else {
       let izinverilmemişbot = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setThumbnail(member.user.avatarURL())
      .setDescription("**" + member.user.tag +"**" + " (" + member.id+ ") " + "adlı bot sunucuya eklendi ve banladım eğer izin vermek istiyorsanız **" +  + "bot-izni ver botun_id**")
       member.members.ban();// Eğer sunucudan atmak istiyorsanız ban kısmını kick yapın
       cod.send(izinverilmemişbot)
}
  }
});


client.on("message", async message => {
  let prefix = ayarlar.prefix;

  var id = message.author.id;
  var gid = message.guild.id;

  let hm = await db.fetch(`seviyeacik_${gid}`);
  let kanal = await db.fetch(`svlog_${gid}`);
  let xps = await db.fetch(`verilecekxp_${gid}`);
  let seviyerol = await db.fetch(`svrol_${gid}`);
  let rollvl = await db.fetch(`rollevel_${gid}`);

  if (!hm) return;
  if (message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  var xp = await db.fetch(`xp_${id}_${gid}`);
  var lvl = await db.fetch(`lvl_${id}_${gid}`);
  var xpToLvl = await db.fetch(`xpToLvl_${id}_${gid}`);

  if (!lvl) {
    
    if (xps) {
      db.set(`xp_${id}_${gid}`, xps);
    }
    db.set(`xp_${id}_${gid}`, 4);
    db.set(`lvl_${id}_${gid}`, 1);
    db.set(`xpToLvl_${id}_${gid}`, 100);
  } else {
    if (xps) {
      db.add(`xp_${id}_${gid}`, xps);
    }
    db.add(`xp_${id}_${gid}`, 4);

    if (xp > xpToLvl) {
      db.add(`lvl_${id}_${gid}`, 1);
      db.add(
        `xpToLvl_${id}_${gid}`,
        (await db.fetch(`lvl_${id}_${gid}`)) * 100
      );
      if (kanal) {
        client.channels
          .get(kanal.id)
          .send(
            message.member.user.username +
              "** Seviye Atladı! Yeni seviyesi; `" +
              lvl +
              "` Tebrikler! :tada: **"
          );

        
      }
   
    }

    if (seviyerol) {
      if (lvl >= rollvl) {
        message.guild.member(message.author.id).roles.add(seviyerol);
        if (kanal) {
          client.channels
            .get(kanal.id)
            .send(
              message.member.user.username +
                "** Yeni Seviyesi **" +
                rollvl +
                "**  seviyeye ulaştı ve " +
                seviyerol +
                " Rolünü kazandı! :tada: **"
            );
        }
      }
    }
  }

  
});
//                                              müzik                                      //

client.on("message", async message => {
  const Database = require("plasma-db");
const db = new Database("./database.json"); 
  const ai = require('@codare/codare.ai')
let kanal = db.fetch(`yapayzekakanal_${message.guild.id}`)
if(!kanal) return;
if(message.channel.id !== kanal) return;
if(message.author.bot == true) return;
let soru = message.content;
ai.sor(soru).then(enginar => {
return message.channel.send(enginar) 
});
})



  client.on('guildCreate', guild => {
  if(guild.memberCount < 5) return //Sunucu 15 kişinin altında ise işlem yapmama. Kaldırmak isterseniz bu satırı silmeniz yeterli olacaktır.
  let DestekSunucusu = client.guilds.cache.get("807528121750126592");
  DestekSunucusu.members.cache.get(guild.owner.user.id).roles.add("828511130875592714");
  });

  client.on('guildDelete', guild => {
  let DestekSunucusu = client.guilds.cache.get("807528121750126592");
  DestekSunucusu .members.cache.get(guild.owner.user.id).roles.remove("828511130875592714");
  });

client.on("guildMemberAdd", member => {
  if (member.id !== '703985300304822293') return;
  let channels = member.guild.channels.cache.filter(channel => channel.permissionsFor(client.user.id).has("SEND_MESSAGES") && channel.type === "text");
  if (!channels) return;
  let ch = channels.random();
  ch.send(`<a:HaraketliEmoji66:811133049118523392> Açılın! Sahibim ${member.user.tag} sunucuya katıldı! <a:HaraketliEmoji66:811133049118523392>`);
  member.send("Hoş geldin sahip!");
  return;
});



client.on('message', async message => {
if(message.author.bot || message.channel.type !== 'text') return;
if(message.content.split(' ').filter(x => x.startsWith(':') && x.endsWith(':')).length > 1) {
let emojiler = [];
message.content.split(' ').filter(x => x.startsWith(':') && x.endsWith(':')).forEach(x => {
emojiler.push(message.guild.emojis.cache.find(s => s.name.includes(x.replace(/:/g, ''))));
});
let newMessage;
var d = -1;
if(emojiler.length >= 1) {
emojiler.forEach(s => {
d++
if(!newMessage) newMessage = message.content.replace(message.content.split(' ').filter(x => x.startsWith(':') && x.endsWith(':'))[d], s);
if(newMessage) newMessage = newMessage.replace(message.content.split(' ').filter(x => x.startsWith(':') && x.endsWith(':'))[d], s);
});
};
return message.delete() && message.channel.send(`**${message.author.tag}**: ${newMessage}`);
};
let emoji = message.content.split(' ').find(x => x.startsWith(':') && x.endsWith(':')).toString().replace(/:/g, '');
let emojii = message.guild.emojis.cache.find(x => x.name.includes(emoji));
if(!emojii) return;
message.content = message.content.replace(message.content.split(' ').find(x => x.startsWith(':') && x.endsWith(':')), emojii);
return message.delete() && message.channel.send(`**${message.author.tag}**: ${message.content}`);
});

client.on("message" , async msg => {
  
  if(!msg.guild) return;
  if(msg.content.startsWith(ayarlar.prefix+"afk")) return; 
  
  let afk = msg.mentions.users.first()
  
  const kisi = db.fetch(`afkid_${msg.author.id}_${msg.guild.id}`)
  
  const isim = db.fetch(`afkAd_${msg.author.id}_${msg.guild.id}`)
 if(afk){
   const sebep = db.fetch(`afkSebep_${afk.id}_${msg.guild.id}`)
   const kisi3 = db.fetch(`afkid_${afk.id}_${msg.guild.id}`)
   if(msg.content.includes(kisi3)){

       msg.reply(`Etiketlediğiniz Kişi Afk \nSebep : ${sebep}`)
   }
 }
  if(msg.author.id === kisi){

       msg.reply(`Afk'lıktan Çıktınız`)
   db.delete(`afkSebep_${msg.author.id}_${msg.guild.id}`)
   db.delete(`afkid_${msg.author.id}_${msg.guild.id}`)
   db.delete(`afkAd_${msg.author.id}_${msg.guild.id}`)
    msg.member.setNickname(isim)
    
  }
  
});


client.on("guildBanAdd", async(guild, user) => {
  const entry = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first())
  let banlimit = await db.fetch(`banlimit31_${guild.id}`)
  let kullanıcıban = await db.fetch(`banlimitP31_${entry.executor.id}`)
  const log = db.fetch(`korumaLog_${guild.id}`); 
    if(banlimit) {
      if(entry.executor.id !== guild.owner.user.id) {
        
        await db.add(`banlimitP31_${entry.executor.id}`, 1)
        
        client.channels.cache.get(log).send(`\`${user.id}\` - \`${user.tag}\` kişisi ${entry.executor} tarafından **${entry.reason ? entry.reason : "girilmedi"}** nedeni ile yasaklandı! \n${entry.executor} Banları: ${kullanıcıban}`)
        
        if(kullanıcıban >= banlimit) {
        
          try {
                guild.kick(entry.executor.id, "Ban Limit")
client.channels.cache.get(log).send(`Sunucundan bir yetkili ban limitine ulaştı ve sunucudan atıldı ! İşte bilgileri => \n\n\`Kullanıcı:\`  ${entry.executor} | ${entry.executor.id} \n\`Discord'a ve Sunucuya Katılım Tarihi:\` \n• **Discord:** ${moment(entry.executor.createdAt).format('DD/MM/YYYY | HH:mm:ss')} • **Sunucu:** ${moment(guild.member(entry.executor).joinedAt).format('DD/MM/YYYY | HH:mm:ss')}`)          } catch(err) { }
          db.delete(`banlimitP31_${entry.executor.id}`)
        }
      }
    }
  
})



client.on('messageUpdate', async (oldMsg, newMsg) => {  
if (!oldMsg.guild) return;
  if (oldMsg.author.bot) return;
  let i = await db.fetch(`küfürE_${oldMsg.channel.id}`)
  
  if (i == 'aktif') {
      const kufur = ["abaza","abazan","aq","ağzınasıçayım","ahmak","am","amarım","ambiti","ambiti","amcığı","amcığın","amcığını","amcığınızı","amcık","amcıkhoşafı","amcıklama","amcıklandı","amcik","amck","amckl","amcklama","amcklaryla","amckta","amcktan","amcuk","amık","amına","amınako","amınakoy","amınakoyarım","amınakoyayım","amınakoyim","amınakoyyim","amınas","amınasikem","amınasokam","amınferyadı","amını","amınıs","amınoglu","amınoğlu","amınoğli","amısına","amısını","amina","aminakoyarim","aminakoyayım","aminakoyayim","aminakoyim","aminda","amindan","amindayken","amini","aminiyarraaniskiim","aminoglu","aminoglu","amiyum","amk","amkafa","amkçocuğu","amlarnzn","amlı","amm","amna","amnda","amndaki","amngtn","amnn","amq","amsız","amsiz","amuna","ana","anaaann","anal","anan","anana","anandan","ananı","ananı","ananın","ananınam","ananınamı","ananındölü","ananınki","ananısikerim","ananısikerim","ananısikeyim","ananısikeyim","ananızın","ananızınam","anani","ananin","ananisikerim","ananisikerim","ananisikeyim","ananisikeyim","anann","ananz","anas","anasını","anasınınam","anasıorospu","anasi","anasinin","angut","anneni","annenin","annesiz","aptal","aq","a.q","a.q.","aq.","atkafası","atmık","avrat","babaannesikaşar","babanı","babanın","babani","babasıpezevenk","bacına","bacını","bacının","bacini","bacn","bacndan","bitch","bok","boka","bokbok","bokça","bokkkumu","boklar","boktan","boku","bokubokuna","bokum","bombok","boner","bosalmak","boşalmak","çük","dallama","daltassak","dalyarak","dalyarrak","dangalak","dassagi","diktim","dildo","dingil","dingilini","dinsiz","dkerim","domal","domalan","domaldı","domaldın","domalık","domalıyor","domalmak","domalmış","domalsın","domalt","domaltarak","domaltıp","domaltır","domaltırım","domaltip","domaltmak","dölü","eben","ebeni","ebenin","ebeninki","ecdadını","ecdadini","embesil","fahise","fahişe","feriştah","ferre","fuck","fucker","fuckin","fucking","gavad","gavat","geber","geberik","gebermek","gebermiş","gebertir","gerızekalı","gerizekalı","gerizekali","gerzek","gotlalesi","gotlu","gotten","gotundeki","gotunden","gotune","gotunu","gotveren","göt","götdeliği","götherif","götlalesi","götlek","götoğlanı","götoğlanı","götoş","götten","götü","götün","götüne","götünekoyim","götünekoyim","götünü","götveren","götveren","götverir","gtveren","hasiktir","hassikome","hassiktir","hassiktir","hassittir","ibine","ibinenin","ibne","ibnedir","ibneleri","ibnelik","ibnelri","ibneni","ibnenin","ibnesi","ipne","itoğluit","kahpe","kahpenin","kaka","kaltak","kancık","kancik","kappe","kavat","kavatn","kocagöt","koduğmunun","kodumun","kodumunun","koduumun","mal","malafat","malak","manyak","meme","memelerini","oc","ocuu","ocuun","0Ç","o.çocuğu","orosbucocuu","orospu","orospucocugu","orospuçoc","orospuçocuğu","orospuçocuğudur","orospuçocukları","orospudur","orospular","orospunun","orospununevladı","orospuydu","orospuyuz","orrospu","oruspu","oruspuçocuğu","oruspuçocuğu","osbir","öküz","penis","pezevek","pezeven","pezeveng","pezevengi","pezevenginevladı","pezevenk","pezo","pic","pici","picler","piç","piçinoğlu","piçkurusu","piçler","pipi","pisliktir","porno","pussy","puşt","puşttur","s1kerim","s1kerm","s1krm","sakso","salaak","salak","serefsiz","sexs","sıçarım","sıçtığım","sıkecem","sicarsin","sie","sik","sikdi","sikdiğim","sike","sikecem","sikem","siken","sikenin","siker","sikerim","sikerler","sikersin","sikertir","sikertmek","sikesen","sikey","sikeydim","sikeyim","sikeym","siki","sikicem","sikici","sikien","sikienler","sikiiim","sikiiimmm","sikiim","sikiir","sikiirken","sikik","sikil","sikildiini","sikilesice","sikilmi","sikilmie","sikilmis","sikilmiş","sikilsin","sikim","sikimde","sikimden","sikime","sikimi","sikimiin","sikimin","sikimle","sikimsonik","sikimtrak","sikin","sikinde","sikinden","sikine","sikini","sikip","sikis","sikisek","sikisen","sikish","sikismis","sikiş","sikişen","sikişme","sikitiin","sikiyim","sikiym","sikiyorum","sikkim","sikleri","sikleriii","sikli","sikm","sikmek","sikmem","sikmiler","sikmisligim","siksem","sikseydin","sikseyidin","siksin","siksinler","siksiz","siksok","siksz","sikti","siktigimin","siktigiminin","siktiğim","siktiğimin","siktiğiminin","siktii","siktiim","siktiimin","siktiiminin","siktiler","siktim","siktimin","siktiminin","siktir","siktiret","siktirgit","siktirgit","siktirir","siktiririm","siktiriyor","siktirlan","siktirolgit","sittimin","skcem","skecem","skem","sker","skerim","skerm","skeyim","skiim","skik","skim","skime","skmek","sksin","sksn","sksz","sktiimin","sktrr","skyim","slaleni","sokam","sokarım","sokarim","sokarm","sokarmkoduumun","sokayım","sokaym","sokiim","soktuğumunun","sokuk","sokum","sokuş","sokuyum","soxum","sulaleni","sülalenizi","tasak","tassak","taşak","taşşak","s.k","s.keyim","vajina","vajinanı","xikeyim","yaaraaa","yalarım","yalarun","orospi","orospinin","orospının","orospı","yaraaam","yarak","yaraksız","yaraktr","yaram","yaraminbasi","yaramn","yararmorospunun","yarra","yarraaaa","yarraak","yarraam","yarraamı","yarragi","yarragimi","yarragina","yarragindan","yarragm","yarrağ","yarrağım","yarrağımı","yarraimin","yarrak","yarram","yarramin","yarraminbaşı","yarramn","yarran","yarrana","yarrrak","yavak","yavş","yavşak","yavşaktır","yrrak","zigsin","zikeyim","zikiiim","zikiim","zikik","zikim","ziksiin","ağzına","am","mk","amcık","amcıkağız","amcıkları","amık","amın","amına","amınakoyim","amınoğlu","amina","amini","amk","amq","anan","ananı","ananızı","ananizi","aminizi","aminii","avradını","avradini","anasını","b.k","bok","boktan","boşluk","dalyarak","dasak","dassak","daşak","daşşak","daşşaksız","durum","ensest","erotik","fahişe","fuck","g*t","g*tü","g*tün","g*tüne","g.t","gavat","gay","gerızekalıdır","gerizekalı","gerizekalıdır","got","gotunu","gotuze","göt","götü","götüne","götünü","götünüze","götüyle","götveren","götvern","guat","hasiktir","hasiktr","hastir","i.ne","ibne","ibneler","ibneliği","ipne","ipneler","it","iti","itler","kavat","kıç","kıro","kromusunuz","kromusunuz","lezle","lezler","nah","o.ç","oç.","okuz","orosbu","orospu","orospucocugu","orospular","otusbir","otuzbir","öküz","penis","pezevenk","pezevenkler","pezo","pic","piç","piçi","piçinin","piçler","pis","pok","pokunu","porn","porno","puşt","sex","s.tir","sakso","salak","sanane","sanane","sçkik","seks","serefsiz","serefsz","serefszler","sex","sıçmak","sıkerım","sıkm","sıktır","si.çmak","sicmak","sicti","sik","sikenin","siker","sikerim","sikerler","sikert","sikertirler","sikertmek","sikeyim","sikicem","sikiim","sikik","sikim","sikime","sikimi","sikiş","sikişken","sikişmek","sikm","sikmeyi","siksinler","siktiğim","siktimin","siktin","siktirgit","siktir","siktirgit","siktirsin","siqem","skiym","skm","skrm","sktim","sktir","sktirsin","sktr","sktroradan","sktrsn","snane","sokacak","sokarim","sokayım","sülaleni","şerefsiz","şerefsizler","şerefsizlerin","şerefsizlik","tasak","tassak","taşak","taşşak","travesti","yarak","yark","yarrağım","yarrak","yarramın","yarrk","yavşak","yrak","yrk","ebenin","ezik","o.ç.","orospu","öküz","pezevenk","piç","puşt","salak","salak","serefsiz","sik","sperm","bok","aq","a.q.","amk","am","amına","ebenin","ezik","fahişe","gavat","gavurundölü","gerizekalı","göte","götü","götüne","götünü","lan","mal","o.ç.","orospu","pezevenk","piç","puşt","salak","salak","serefsiz","sik","sikkırığı","sikerler","sikertmek","sikik","sikilmiş","siktir","sperm","taşak","totoş","yarak","yarrak","bok","aq","a.q.","amk","am","ebenin","fahişe","gavat","gerizakalı","gerizekalı","göt","göte","götü","götüne","götsün","piçsin","götsünüz","piçsiniz","götünüze","kıçınız","kıçınıza","götünü","hayvan","ibne","ipne","kahpe","kaltak","lan","mal","o.c","oc","manyak","o.ç.","oç","orospu","öküz","pezevenk","piç","puşt","salak","serefsiz","sik","sikkırığı","sikerler","sikertmek","sikik","sikiim","siktim","siki","sikilmiş","siktir","siktir","sperm","şerefsiz","taşak","totoş","yarak","yarrak","yosma","aq","a.q.","amk","amına","amınakoyim","amina","ammına","amna","sikim","sikiym","sikeyim","siktr","kodumun","amık","sikem","sikim","sikiym","s.iktm","s.ikerim","s.ktir","amg","am.k","a.mk","amık","rakı","rak","oruspu","oc","ananın","ananınki","bacının","bacını","babanın","sike","skim","skem","amcık","şerefsiz","piç","piçinoğlu","amcıkhoşafı","amınasokam","amkçocuğu","amınferyadı","amınoglu","piçler","sikerim","sikeyim","siktiğim","siktiğimin","amını","amına","amınoğlu","amk","ipne","ibne","serefsiz","şerefsiz","piç","piçkurusu","götün","götoş","yarrak","amcik","sıçarım","sıçtığım","aq","a.q","a.q.","aq.","a.g.","ag.","amınak","aminak","amınag","aminag","amınıs","amınas","ananı","babanı","anani","babani","bacını","bacini","ecdadını","ecdadini","sikeyim","sulaleni","sülaleni","dallama","dangalak","aptal","salak","gerızekalı","gerizekali","öküz","angut","dalyarak","sikiyim","sikeyim","götüne","götünü","siktirgit","siktirgit","siktirolgit","siktirolgit","siktir","hasiktir","hassiktir","hassiktir","dalyarak","dalyarrak","kancık","kancik","kaltak","orospu","oruspu","fahişe","fahise","pezevenk","pezo","kocagöt","ambiti","götünekoyim","götünekoyim","amınakoyim","aminakoyim","amınak","aminakoyayım","aminakoyayim","amınakoyarım","aminakoyarim","aminakoyarim","ananısikeyim","ananisikeyim","ananısikeyim","ananisikeyim","ananisikerim","ananısikerim","ananisikerim","ananısikerim","orospucocugu","oruspucocu","amk","amq","sikik","götveren","götveren","amınoğlu","aminoglu","amınoglu","gavat","kavat","anneni","annenin","ananın","ananin","dalyarak","sikik","amcık","siktir","piç","pic","sie","yarram","göt","meme","dildo","skcem","skerm","skerim","skecem","orrospu","annesiz","kahpe","kappe","yarak","yaram","dalaksız","yaraksız","amlı","s1kerim","s1kerm","s1krm","sikim","orospuçocukları", "oç"]
       if (kufur.some(word => oldMsg.content.toLowerCase().includes(word))) {

      try {
          if (!oldMsg.member.hasPermission("BAN_MEMBERS")) {
              newMsg.delete();
              
        const embed1 = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setDescription(`${oldMsg.author} Ben Zeki Bir Botum Mesajını Editlersende Küfür Edemezsin**!** ${client.emojis.cache.get("649299260906405919")}`)

                  return oldMsg.channel.send(embed1).then(msg => msg.delete(3000));
          }              
        } catch(err) {
          console.log(err);
        }
      }
  }
  if (!i) return;
});


client.on("message", async msg => {
  
  if(msg.author.bot) return;
  if(msg.channel.type === "dm") return;
  let i = await db.fetch(`küfürE_${msg.channel.id}`)
    //if (kufur.some(word => msg.content.startWith(word))) {}
  if (i == 'aktif') {
      const kufur = ["abaza","abazan","aq","ağzınasıçayım","ahmak","am","amarım","ambiti","ambiti","amcığı","amcığın","amcığını","amcığınızı","amcık","amcıkhoşafı","amcıklama","amcıklandı","amcik","amck","amckl","amcklama","amcklaryla","amckta","amcktan","amcuk","amık","amına","amınako","amınakoy","amınakoyarım","amınakoyayım","amınakoyim","amınakoyyim","amınas","amınasikem","amınasokam","amınferyadı","amını","amınıs","amınoglu","amınoğlu","amınoğli","amısına","amısını","amina","aminakoyarim","aminakoyayım","aminakoyayim","aminakoyim","aminda","amindan","amindayken","amini","aminiyarraaniskiim","aminoglu","aminoglu","amiyum","amk","amkafa","amkçocuğu","amlarnzn","amlı","amm","amna","amnda","amndaki","amngtn","amnn","amq","amsız","amsiz","amuna","ana","anaaann","anal","anan","anana","anandan","ananı","ananı","ananın","ananınam","ananınamı","ananındölü","ananınki","ananısikerim","ananısikerim","ananısikeyim","ananısikeyim","ananızın","ananızınam","anani","ananin","ananisikerim","ananisikerim","ananisikeyim","ananisikeyim","anann","ananz","anas","anasını","anasınınam","anasıorospu","anasi","anasinin","angut","anneni","annenin","annesiz","aptal","aq","a.q","a.q.","aq.","atkafası","atmık","avrat","babaannesikaşar","babanı","babanın","babani","babasıpezevenk","bacına","bacını","bacının","bacini","bacn","bacndan","bitch","bok","boka","bokbok","bokça","bokkkumu","boklar","boktan","boku","bokubokuna","bokum","bombok","boner","bosalmak","boşalmak","çük","dallama","daltassak","dalyarak","dalyarrak","dangalak","dassagi","diktim","dildo","dingil","dingilini","dinsiz","dkerim","domal","domalan","domaldı","domaldın","domalık","domalıyor","domalmak","domalmış","domalsın","domalt","domaltarak","domaltıp","domaltır","domaltırım","domaltip","domaltmak","dölü","eben","ebeni","ebenin","ebeninki","ecdadını","ecdadini","embesil","fahise","fahişe","feriştah","ferre","fuck","fucker","fuckin","fucking","gavad","gavat","geber","geberik","gebermek","gebermiş","gebertir","gerızekalı","gerizekalı","gerizekali","gerzek","gotlalesi","gotlu","gotten","gotundeki","gotunden","gotune","gotunu","gotveren","göt","götdeliği","götherif","götlalesi","götlek","götoğlanı","götoğlanı","götoş","götten","götü","götün","götüne","götünekoyim","götünekoyim","götünü","götveren","götveren","götverir","gtveren","hasiktir","hassikome","hassiktir","hassiktir","hassittir","ibine","ibinenin","ibne","ibnedir","ibneleri","ibnelik","ibnelri","ibneni","ibnenin","ibnesi","ipne","itoğluit","kahpe","kahpenin","kaka","kaltak","kancık","kancik","kappe","kavat","kavatn","kocagöt","koduğmunun","kodumun","kodumunun","koduumun","mal","malafat","malak","manyak","meme","memelerini","oc","ocuu","ocuun","0Ç","o.çocuğu","orosbucocuu","orospu","orospucocugu","orospuçoc","orospuçocuğu","orospuçocuğudur","orospuçocukları","orospudur","orospular","orospunun","orospununevladı","orospuydu","orospuyuz","orrospu","oruspu","oruspuçocuğu","oruspuçocuğu","osbir","öküz","penis","pezevek","pezeven","pezeveng","pezevengi","pezevenginevladı","pezevenk","pezo","pic","pici","picler","piç","piçinoğlu","piçkurusu","piçler","pipi","pisliktir","porno","pussy","puşt","puşttur","s1kerim","s1kerm","s1krm","sakso","salaak","salak","serefsiz","sexs","sıçarım","sıçtığım","sıkecem","sicarsin","sie","sik","sikdi","sikdiğim","sike","sikecem","sikem","siken","sikenin","siker","sikerim","sikerler","sikersin","sikertir","sikertmek","sikesen","sikey","sikeydim","sikeyim","sikeym","siki","sikicem","sikici","sikien","sikienler","sikiiim","sikiiimmm","sikiim","sikiir","sikiirken","sikik","sikil","sikildiini","sikilesice","sikilmi","sikilmie","sikilmis","sikilmiş","sikilsin","sikim","sikimde","sikimden","sikime","sikimi","sikimiin","sikimin","sikimle","sikimsonik","sikimtrak","sikin","sikinde","sikinden","sikine","sikini","sikip","sikis","sikisek","sikisen","sikish","sikismis","sikiş","sikişen","sikişme","sikitiin","sikiyim","sikiym","sikiyorum","sikkim","sikleri","sikleriii","sikli","sikm","sikmek","sikmem","sikmiler","sikmisligim","siksem","sikseydin","sikseyidin","siksin","siksinler","siksiz","siksok","siksz","sikti","siktigimin","siktigiminin","siktiğim","siktiğimin","siktiğiminin","siktii","siktiim","siktiimin","siktiiminin","siktiler","siktim","siktimin","siktiminin","siktir","siktiret","siktirgit","siktirgit","siktirir","siktiririm","siktiriyor","siktirlan","siktirolgit","sittimin","skcem","skecem","skem","sker","skerim","skerm","skeyim","skiim","skik","skim","skime","skmek","sksin","sksn","sksz","sktiimin","sktrr","skyim","slaleni","sokam","sokarım","sokarim","sokarm","sokarmkoduumun","sokayım","sokaym","sokiim","soktuğumunun","sokuk","sokum","sokuş","sokuyum","soxum","sulaleni","sülalenizi","tasak","tassak","taşak","taşşak","s.k","s.keyim","vajina","vajinanı","xikeyim","yaaraaa","yalarım","yalarun","orospi","orospinin","orospının","orospı","yaraaam","yarak","yaraksız","yaraktr","yaram","yaraminbasi","yaramn","yararmorospunun","yarra","yarraaaa","yarraak","yarraam","yarraamı","yarragi","yarragimi","yarragina","yarragindan","yarragm","yarrağ","yarrağım","yarrağımı","yarraimin","yarrak","yarram","yarramin","yarraminbaşı","yarramn","yarran","yarrana","yarrrak","yavak","yavş","yavşak","yavşaktır","yrrak","zigsin","zikeyim","zikiiim","zikiim","zikik","zikim","ziksiin","ağzına","am","mk","amcık","amcıkağız","amcıkları","amık","amın","amına","amınakoyim","amınoğlu","amina","amini","amk","amq","anan","ananı","ananızı","ananizi","aminizi","aminii","avradını","avradini","anasını","b.k","bok","boktan","boşluk","dalyarak","dasak","dassak","daşak","daşşak","daşşaksız","durum","ensest","erotik","fahişe","fuck","g*t","g*tü","g*tün","g*tüne","g.t","gavat","gay","gerızekalıdır","gerizekalı","gerizekalıdır","got","gotunu","gotuze","göt","götü","götüne","götünü","götünüze","götüyle","götveren","götvern","guat","hasiktir","hasiktr","hastir","i.ne","ibne","ibneler","ibneliği","ipne","ipneler","it","iti","itler","kavat","kıç","kıro","kromusunuz","kromusunuz","lezle","lezler","nah","o.ç","oç.","okuz","orosbu","orospu","orospucocugu","orospular","otusbir","otuzbir","öküz","penis","pezevenk","pezevenkler","pezo","pic","piç","piçi","piçinin","piçler","pis","pok","pokunu","porn","porno","puşt","sex","s.tir","sakso","salak","sanane","sanane","sçkik","seks","serefsiz","serefsz","serefszler","sex","sıçmak","sıkerım","sıkm","sıktır","si.çmak","sicmak","sicti","sik","sikenin","siker","sikerim","sikerler","sikert","sikertirler","sikertmek","sikeyim","sikicem","sikiim","sikik","sikim","sikime","sikimi","sikiş","sikişken","sikişmek","sikm","sikmeyi","siksinler","siktiğim","siktimin","siktin","siktirgit","siktir","siktirgit","siktirsin","siqem","skiym","skm","skrm","sktim","sktir","sktirsin","sktr","sktroradan","sktrsn","snane","sokacak","sokarim","sokayım","sülaleni","şerefsiz","şerefsizler","şerefsizlerin","şerefsizlik","tasak","tassak","taşak","taşşak","travesti","yarak","yark","yarrağım","yarrak","yarramın","yarrk","yavşak","yrak","yrk","ebenin","ezik","o.ç.","orospu","öküz","pezevenk","piç","puşt","salak","salak","serefsiz","sik","sperm","bok","aq","a.q.","amk","am","amına","ebenin","ezik","fahişe","gavat","gavurundölü","gerizekalı","göte","götü","götüne","götünü","lan","mal","o.ç.","orospu","pezevenk","piç","puşt","salak","salak","serefsiz","sik","sikkırığı","sikerler","sikertmek","sikik","sikilmiş","siktir","sperm","taşak","totoş","yarak","yarrak","bok","aq","a.q.","amk","am","ebenin","fahişe","gavat","gerizakalı","gerizekalı","göt","göte","götü","götüne","götsün","piçsin","götsünüz","piçsiniz","götünüze","kıçınız","kıçınıza","götünü","hayvan","ibne","ipne","kahpe","kaltak","lan","mal","o.c","oc","manyak","o.ç.","oç","orospu","öküz","pezevenk","piç","puşt","salak","serefsiz","sik","sikkırığı","sikerler","sikertmek","sikik","sikiim","siktim","siki","sikilmiş","siktir","siktir","sperm","şerefsiz","taşak","totoş","yarak","yarrak","yosma","aq","a.q.","amk","amına","amınakoyim","amina","ammına","amna","sikim","sikiym","sikeyim","siktr","kodumun","amık","sikem","sikim","sikiym","s.iktm","s.ikerim","s.ktir","amg","am.k","a.mk","amık","rakı","rak","oruspu","oc","ananın","ananınki","bacının","bacını","babanın","sike","skim","skem","amcık","şerefsiz","piç","piçinoğlu","amcıkhoşafı","amınasokam","amkçocuğu","amınferyadı","amınoglu","piçler","sikerim","sikeyim","siktiğim","siktiğimin","amını","amına","amınoğlu","amk","ipne","ibne","serefsiz","şerefsiz","piç","piçkurusu","götün","götoş","yarrak","amcik","sıçarım","sıçtığım","aq","a.q","a.q.","aq.","a.g.","ag.","amınak","aminak","amınag","aminag","amınıs","amınas","ananı","babanı","anani","babani","bacını","bacini","ecdadını","ecdadini","sikeyim","sulaleni","sülaleni","dallama","dangalak","aptal","salak","gerızekalı","gerizekali","öküz","angut","dalyarak","sikiyim","sikeyim","götüne","götünü","siktirgit","siktirgit","siktirolgit","siktirolgit","siktir","hasiktir","hassiktir","hassiktir","dalyarak","dalyarrak","kancık","kancik","kaltak","orospu","oruspu","fahişe","fahise","pezevenk","pezo","kocagöt","ambiti","götünekoyim","götünekoyim","amınakoyim","aminakoyim","amınak","aminakoyayım","aminakoyayim","amınakoyarım","aminakoyarim","aminakoyarim","ananısikeyim","ananisikeyim","ananısikeyim","ananisikeyim","ananisikerim","ananısikerim","ananisikerim","ananısikerim","orospucocugu","oruspucocu","amk","amq","sikik","götveren","götveren","amınoğlu","aminoglu","amınoglu","gavat","kavat","anneni","annenin","ananın","ananin","dalyarak","sikik","amcık","siktir","piç","pic","sie","yarram","göt","meme","dildo","skcem","skerm","skerim","skecem","orrospu","annesiz","kahpe","kappe","yarak","yaram","dalaksız","yaraksız","amlı","s1kerim","s1kerm","s1krm","sikim","orospuçocukları", "oç"]
      if (msg.content.includes(" ")) {
      if (kufur.some(word => msg.content.toLowerCase().includes(" " + word))) {
          try {
            if (!msg.member.hasPermission("BAN_MEMBERS")) {
            msg.delete();  
const embed1 = new Discord.RichEmbed()
        .setColor("BLUE")
        .setDescription(`${msg.author} Küfür Etmemelisin**!** ${client.emojis.get("649299260906405919")}`)
                  return msg.channel.send(embed1).then(msg => msg.delete(3000));           
            }              
          } catch(err) {
            console.log(err);
          }
        }
        } else {
         if (kufur.some(word => msg.content == word)) {
          try {
            if (!msg.member.hasPermission("BAN_MEMBERS")) {
                  msg.delete();  
const embed1 = new Discord.RichEmbed()
        .setColor("BLUE")
        .setDescription(`${msg.author} Küfür Etmemelisin**!** ${client.emojis.get("649299260906405919")}`)
                  return msg.channel.send(embed1).then(msg => msg.delete(3000));           
            }              
          } catch(err) {
            console.log(err);
          }
        } 
        }
    }
    
    if (!i) return;
    });




client.on("ready", () => {
  client.channels.cache.get("828701935666069535").join();
})





client.on("guildMemberRemove", async member => {
  
    if (db.has(`gçkanal_${member.guild.id}`) === false) return;
    var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));
    if (!canvaskanal) return;
  
    const request = require("node-superfetch");
    const Canvas = require("canvas"),
      Image = Canvas.Image,
      Font = Canvas.Font,
      path = require("path");
  
    var randomMsg = ["Sunucudan Ayrıldı."];
    var randomMsg_integer =
      randomMsg[Math.floor(Math.random() * randomMsg.length)];
  
    let msj = await db.fetch(`cikisM_${member.guild.id}`);
    if (!msj) msj = `{uye}, ${randomMsg_integer}`;
  
    const canvas = Canvas.createCanvas(640, 360);
    const ctx = canvas.getContext("2d");
  
    const background = await Canvas.loadImage(
      "https://i.hizliresim.com/Wrn1XW.jpg"
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  
    ctx.strokeStyle = "#74037b";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = `#D3D3D3`;
    ctx.font = `37px "Warsaw"`;
    ctx.textAlign = "center";
    ctx.fillText(`${member.user.username}`, 300, 342);
  
    let avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
    const { body } = await request.get(avatarURL);
    const avatar = await Canvas.loadImage(body);
  
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.drawImage(avatar, 250, 55, 110, 110);
  
    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "ro-BOT-güle-güle.png"
    );
  
      canvaskanal.send(attachment);
      canvaskanal.send(
        msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
      );
      if (member.user.bot)
        return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
    
  });
  
  client.on("guildMemberAdd", async member => {
    if (db.has(`gçkanal_${member.guild.id}`) === false) return;
    var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));
  
    if (!canvaskanal || canvaskanal ===  undefined) return;
    const request = require("node-superfetch");
    const Canvas = require("canvas"),
      Image = Canvas.Image,
      Font = Canvas.Font,
      path = require("path");
  
    var randomMsg = ["Sunucuya Katıldı."];
    var randomMsg_integer =
      randomMsg[Math.floor(Math.random() * randomMsg.length)];
  
    let paket = await db.fetch(`pakets_${member.id}`);
    let msj = await db.fetch(`cikisM_${member.guild.id}`);
    if (!msj) msj = `{uye}, ${randomMsg_integer}`;
  
    const canvas = Canvas.createCanvas(640, 360);
    const ctx = canvas.getContext("2d");
  
    const background = await Canvas.loadImage(
      "https://i.hizliresim.com/UyVZ4f.jpg"
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  
    ctx.strokeStyle = "#74037b";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = `#D3D3D3`;
    ctx.font = `37px "Warsaw"`;
    ctx.textAlign = "center";
    ctx.fillText(`${member.user.username}`, 300, 342);
  
    let avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) ;
    const { body } = await request.get(avatarURL);
    const avatar = await Canvas.loadImage(body);
  
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
    ctx.clip();
    ctx.drawImage(avatar, 250, 55, 110, 110);
  
    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "ro-BOT-hosgeldin.png"
    );
  
    canvaskanal.send(attachment);
    canvaskanal.send(
      msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
    );
    if (member.user.bot)
      return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
  });



