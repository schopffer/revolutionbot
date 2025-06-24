const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ID du salon #bienvenue
const welcomeChannelId = '1385999517983440967';
// ID du salon pour l'autorole
const autoroleChannelId = '1385943465321566289';

// Emoji => RoleID mapping
const roleEmojis = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005'  // Salon trash
};

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 🎉 Message de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return console.error("❌ Salon #bienvenue introuvable");

  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

  try {
    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
    console.log(`✅ Message de bienvenue envoyé pour ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du message :", err);
  }
});

// 🛠️ Commande !autorole pour poster le message des rôles
client.on('messageCreate', async message => {
  if (message.content === '!autorole' && message.channel.id === autoroleChannelId) {
    const embed = new EmbedBuilder()
      .setTitle("🎯 Choisis tes jeux préférés !")
      .setDescription(`
Clique sur les réactions pour obtenir un rôle :

🔫 Valorant  
💥 Fortnite  
🚀 Rocket League  
🎮 Autres jeux  
🔞 Salon trash
      `)
      .setColor(0x5865F2);

    const sentMessage = await message.channel.send({ embeds: [embed] });

    for (const emoji of Object.keys(roleEmojis)) {
      await sentMessage.react(emoji);
    }

    console.log("✅ Message d'autorole envoyé !");
  }
});

// 🎭 Ajout / Retrait de rôle selon les réactions
client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;

  const roleId = roleEmojis[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.add(roleId).catch(console.error);
  console.log(`✅ Rôle ajouté à ${user.tag}`);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;

  const roleId = roleEmojis[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(roleId).catch(console.error);
  console.log(`❌ Rôle retiré à ${user.tag}`);
});

// 🔐 Connexion avec token
client.login(process.env.TOKEN);
