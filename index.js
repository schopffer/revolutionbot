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

// Salon #bienvenue
const welcomeChannelId = '1385999517983440967';

client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return console.error("❌ Salon #bienvenue introuvable");

  const embed = new EmbedBuilder()
    .setTitle(`🎉 Bienvenue ${member.user.username} !`)
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

// 🧠 Commande !autorole
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content !== '!autorole') return;

  // Supprime l’ancien message si présent
  const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
  const oldMsg = fetchedMessages.find(m =>
    m.author.id === client.user.id &&
    m.embeds.length &&
    m.embeds[0].title?.includes('Choisis tes jeux préférés')
  );
  if (oldMsg) {
    try {
      await oldMsg.delete();
    } catch (err) {
      console.error("❌ Impossible de supprimer l’ancien message :", err);
    }
  }

  // Envoie du message embed
  const embed = new EmbedBuilder()
    .setTitle('🎯 Choisis tes jeux préférés pour recevoir les notifs')
    .setDescription(
      `**🔫 Valorant**\n**💥 Fortnite**\n**🚀 Rocket League**\n**🎮 Autres jeux**\n**🔞 Salon trash**\n\n*Clique simplement sur les réactions ci-dessous pour recevoir le rôle associé.*`
    )
    .setColor(0x5865F2)
    .setFooter({ text: "💡 Tu peux proposer d'autres jeux dans le salon discussions !" });

  try {
    const msg = await message.channel.send({ embeds: [embed] });
    await msg.react('🔫');
    await msg.react('💥');
    await msg.react('🚀');
    await msg.react('🎮');
    await msg.react('🔞');
  } catch (err) {
    console.error("❌ Erreur lors de l’envoi ou des réactions :", err);
  }
});

// 🎭 Ajout / suppression des rôles selon réactions
const roleMap = {
  '🔫': '1385980913728487455',       // Valorant
  '💥': '1386063811907162183',       // Fortnite
  '🚀': '1385983179034202112',       // Rocket League
  '🎮': '1385982774619672646',       // Autres jeux
  '🔞': '1386695919675769005'        // Trash
};

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.partial) await reaction.message.fetch();
  const roleId = roleMap[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.add(roleId).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.partial) await reaction.message.fetch();
  const roleId = roleMap[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  await member.roles.remove(roleId).catch(console.error);
});

// 🔐 Connexion
client.login(process.env.TOKEN);
