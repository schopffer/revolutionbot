const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 📦 Discord.js et environnement
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
require('dotenv').config();

// IDs des salons
const welcomeChannelId = '1385999517983440967';
const roleChannelId = '1385943465321566289';

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

// ✅ Démarrage du bot
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
    console.log(`✅ Message de bienvenue envoyé`);
  } catch (err) {
    console.error("❌ Erreur d’envoi :", err);
  }
});

// 🧠 Commande !autorole
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!autorole') {
    const msg = await message.channel.send({
      content: `🎯 Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !

🔫 Valorant  
💥 Fortnite  
🚀 Rocket League  
🎮 Autres jeux  
🔞 Salon trash

💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.`,
    });

    try {
      await msg.react('🔫');
      await msg.react('💥');
      await msg.react('🚀');
      await msg.react('🎮');
      await msg.react('🔞');
    } catch (err) {
      console.error("❌ Impossible d’ajouter les réactions :", err);
    }
  }
});

// 🔐 Lancement du bot
client.login(process.env.TOKEN);
