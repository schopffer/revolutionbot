// 🌐 Mini serveur Express pour Render (évite l'arrêt)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 📦 Importations
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

// 📌 ID du salon de bienvenue
const welcomeChannelId = '1385999517983440967';

// 🎉 Quand le bot est prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue
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
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi du message :", err);
  }
});

// 🧠 Commande !autorole (embed stylé)
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content === '!autorole') {
    const embed = new EmbedBuilder()
      .setTitle("🎯 __**Choisis tes jeux préférés !**__")
      .setDescription(`
Clique sur les réactions ci-dessous pour obtenir un rôle :

🔫 __**Valorant**__  
💥 __**Fortnite**__  
🚀 __**Rocket League**__  
🎮 __**Autres jeux**__  
🔞 __**Salon trash**__

✨ *Tu peux proposer d'autres jeux dans le salon discussions !*`)
      .setColor(0x5865F2)
      .setFooter({ text: 'Réagis à ce message pour recevoir ton rôle.' });

    try {
      const msg = await message.channel.send({ embeds: [embed] });
      await msg.react('🔫');
      await msg.react('💥');
      await msg.react('🚀');
      await msg.react('🎮');
      await msg.react('🔞');

      roleMessageId = msg.id; // pour garder la référence si tu veux l’ajouter plus tard
    } catch (err) {
      console.error("❌ Erreur lors de l’envoi ou des réactions :", err);
    }
  }
});

// ✅ Attribution des rôles via réactions
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error('❌ Erreur lors du fetch de la réaction :', err);
      return;
    }
  }

  const emoji = reaction.emoji.name;
  const member = await reaction.message.guild.members.fetch(user.id);

  const roleMap = {
    '🔫': '1385980913728487455', // Valorant
    '💥': '1386063811907162183', // Fortnite
    '🚀': '1385983179034202112', // Rocket League
    '🎮': '1385982774619672646', // Autres jeux
    '🔞': '1386695919675769005'  // Trash
  };

  const roleId = roleMap[emoji];
  if (!roleId) return;

  try {
    await member.roles.add(roleId);
    console.log(`✅ Rôle ajouté à ${user.tag} : ${emoji}`);
  } catch (err) {
    console.error('❌ Erreur lors de l’ajout du rôle :', err);
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error('❌ Erreur lors du fetch de la réaction :', err);
      return;
    }
  }

  const emoji = reaction.emoji.name;
  const member = await reaction.message.guild.members.fetch(user.id);

  const roleMap = {
    '🔫': '1385980913728487455',
    '💥': '1386063811907162183',
    '🚀': '1385983179034202112',
    '🎮': '1385982774619672646',
    '🔞': '1386695919675769005'
  };

  const roleId = roleMap[emoji];
  if (!roleId) return;

  try {
    await member.roles.remove(roleId);
    console.log(`❌ Rôle retiré à ${user.tag} : ${emoji}`);
  } catch (err) {
    console.error('❌ Erreur lors du retrait du rôle :', err);
  }
});

// 🚀 Connexion du bot
client.login(process.env.TOKEN);
