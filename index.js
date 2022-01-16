const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "/"; //set your bot prefix here
const moment = require('moment')
const guildInvites = new Map();
const fs = require('fs')
const Pagination = require('discord-paginationembed')
const currentDate = new Date()

client.on("ready", async () => {
  client.user.setActivity("Test.exe", {
    type: "PLAYING",
  })
  console.log(`${client.user.tag} is ready`);

  client.guilds.cache.forEach(guild => {
    guild.fetchInvites()
      .then(invites => guildInvites.set(guild.id, invites))
      // .catch(err => client.channels.cache.get(msgChannel).send(`Error in **fetchInvites** catch ${err}`));//smmy add
  })
});

client.on('inviteCreate', async member => guildInvites.set(invite.guild.id, await invite.guild.fetchInvites()));

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase()
  //reset message counts from a certain date
  if (command === 'msg_date') {

    const month = currentDate.getMonth()
    const dat = currentDate.getDate()
    const year = currentDate.getFullYear()

    let users = JSON.parse(fs.readFileSync('./db/msg.json'))
    let ResetJSON = JSON.parse(fs.readFileSync('./db/msg_reset.json'));
    let userArray = []
    let msg_reset = []

    users["users"].forEach(function(part, index, array) {
      array[index].msg_count = 0
    })

    //message.guild.members.cache.forEach(member => userArray.push({user: {'id': member.id, 'msg_count': 0}}))

    fs.writeFileSync('./db/msg.json', JSON.stringify(users));

    msg_reset.push({ msg_reset: { 'date': dat + '-' + (month + 1) + '-' + year } })

    fs.writeFileSync('./db/msg_reset.json', JSON.stringify(msg_reset));

    const embed = new Discord.MessageEmbed()
      .setAuthor(client.user.username, client.user.displayAvatarURL())
      .addField('Operation Completed...', 'A new Date was set by ' + `**${message.author.username}**`)
      .addField('Date set:', dat + '-' + (month + 1) + '-' + year)
      .setDescription('All previoius message counts have been cleared all messages starting from now (**' + dat + '-' + (month + 1) + '-' + year + '**) will be recorded!')
      .setFooter(message.guild.name, message.guild.iconURL())
      .setColor('YELLOW')
    message.channel.send(embed)
  }
  if (command === 'sync') {
    let users = JSON.parse(fs.readFileSync('./db/msg.json'))
    let result = [];
    message.guild.members.cache.forEach(function(part, id) {
      result.push({ "id": id, "msg_count": 0 });
    })

    for (let i = 0; i < users["users"].length; i++) {
      let found = false;
      for (let j = 0; j < result.length; j++) {
        if (result[j].id === users["users"][i].id) {
          found = true;
          result[j].msg_count += users["users"][i].msg_count;
          break;
        }
      }
      if (!found) {
        result.push(users["users"][i]);
      }
    }
    users["users"] = result
    console.log("user debug:", users)
    console.log("writing file:", JSON.stringify(users))
    fs.writeFile('./db/msg.json', JSON.stringify(users), function(err) {
      if (err) return console.log(err);
      console.log('Updated file with no error')
    }
    );
  }


  if (command === 'msglist') {
    let testArray = []
    let result = [];
    let place = 0
    let users = JSON.parse(fs.readFileSync('./db/msg.json'));

    users["users"].forEach(a => testArray.push({ id: a.id, msg_count: a.msg_count }))

    testArray.forEach(function(a) {
      if (!this[a.id]) {
        this[a.id] = { id: a.id, msg_count: 0 };
        result.push(this[a.id]);
      }
      this[a.id].msg_count += a.msg_count;
    }, Object.create(null));

    result.sort(function(a, b) {
      return b.msg_count - a.msg_count;
    });

    function increment() {
      place++;
      return place;
    }
    const date = JSON.parse(fs.readFileSync('./db/msg_reset.json'))

    console.log(result)
    const FieldsEmbed = new Pagination.FieldsEmbed()
      .setArray(result)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .setPageIndicator(true)
      .formatField('Message Leaderboard as of ', el => `\`${increment()}.\`` + ' <@' + el.id + '>   •   ' + `**${el.msg_count}** Messages`)
    FieldsEmbed.embed
      .setColor('YELLOW')
      .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(message.guild.name, message.guild.iconURL())
    FieldsEmbed.build()
  }
}
);


client.on("message", async message => {
  let users = JSON.parse(fs.readFileSync('./db/msg.json'))
  users["users"].forEach(function(part, index, array) {
    if (array[index].id === message.author.id) {
      array[index].msg_count++
    }
  })
  console.log(users)
  // write file below
  fs.writeFile('./db/msg.json', JSON.stringify(users), function(err) {
    if (err) return console.log(err);
    console.log('Updated file')
  }
  );
})

client.on('guildMemberAdd', async member => {
  let users = JSON.parse(fs.readFileSync('./db/msg.json'))
  let check = false

  users["users"].forEach(function(part, index, array) {
    if (array[index].id === member.user.id) {
      check = true
    }
  })
  if (!check) {
    users["users"].push({ "id": member.user.id, "msg_count": 0 });
  }
  fs.writeFile('./db/msg.json', JSON.stringify(users), function(err) {
    if (err) return console.log(err);
    console.log('Updated file')
  }
  );
})

client.login("Nzc3MzEwNTc5NzkwNTc3NjY0.X7Bk4w.9z8dMTsUVKYc3Gy_VdS6gD_VzNg");