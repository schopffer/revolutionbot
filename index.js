// 🌐 Express server pour Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 🤖 Configuration du bot Discord
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🎉 ID des salons et rôles
const welcomeChannelId = '1385999517983440967';
const autoRoleChannelId = '1385943465321566289';
const rulesChannelId = '1385409088824938652';
const memberRoleId = '1387170961769631817';

// 🎮 Rôles à réaction
const roleReactions = {
  '🔫': '1385980913728487455', // Valorant
  '💥': '1386063811907162183', // Fortnite
  '🚀': '1385983179034202112', // Rocket League
  '🎮': '1385982774619672646', // Autres jeux
  '🔞': '1386695919675769005'  // Salon trash
};

// ✅ Bot prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

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

// 🎭 Commande !autorole
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!autorole' && message.channel.id === autoRoleChannelId) {
    const msg = await message.channel.send({
      content: `🎯 **Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !**

**🔫 Valorant**  
**💥 Fortnite**  
**🚀 Rocket League**  
**🎮 Autres jeux**  
**🔞 Salon trash**

💡 *N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.*`
    });

    for (const emoji of Object.keys(roleReactions)) {
      await msg.react(emoji);
    }
  }

  // 📜 Commande !reglement
  if (message.content === '!reglement' && message.channel.id === rulesChannelId) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du Serveur Discord')
      .setColor(0x3498db)
      .setDescription(`
**🤝 Respect et Bienveillance**  
Le respect entre membres est obligatoire.  
Pas d’insultes, harcèlement ou propos haineux.

**🗣️ Comportement et Langage**  
Langage approprié, pas de spam ou pub.  
Reste poli même en cas de désaccord.

**📌 Sujets sensibles**  
Évite politique, religion, contenu NSFW (même en MP sans accord).

**📢 Publicité et Partages**  
Pas de pub sans autorisation.  
Les liens doivent être sûrs.

**🛠️ Utilisation des salons**  
Respecte les thèmes, ne spam pas les pings.

**👑 Staff et Sanctions**  
Le staff est là pour aider. Respecte leurs décisions.  
Sanctions possibles : mute, kick, ban.
      `);

    const button = new ButtonBuilder()
      .setCustomId('acceptRules')
      .setLabel('Valider ✅')
      .setEmoji('☑️') // tu peux remplacer par ton emoji custom si besoin
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ✅ Attribution de rôle après validation du règlement
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'acceptRules') {
    try {
      await interaction.member.roles.add(memberRoleId);
      await interaction.reply({ content: '✅ Règlement accepté ! Bienvenue sur le serveur.', ephemeral: true });
    } catch (err) {
      console.error("❌ Impossible d’ajouter le rôle :", err);
      await interaction.reply({ content: '❌ Erreur : impossible d’ajouter le rôle.', ephemeral: true });
    }
  }
});

// 🎯 Gestion des réactions pour les rôles
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.message.channel.id !== autoRoleChannelId) return;

  const roleId = roleReactions[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.add(roleId).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  if (reaction.message.channel.id !== autoRoleChannelId) return;

  const roleId = roleReactions[reaction.emoji.name];
  if (!roleId) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.remove(roleId).catch(console.error);
});

// 🔐 Connexion
client.login(process.env.TOKEN);
