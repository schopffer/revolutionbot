// 🌐 Serveur Web pour Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

// 📦 Imports Discord
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// IDs
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const membreRoleId = '1385627871023861820';
const emojiId = '1387148694230667448';
const autoroleChannelId = '1385943465321566289';

const rolesMap = {
  '🔫': '1385980913728487455',
  '💥': '1386063811907162183',
  '🚀': '1385983179034202112',
  '🎮': '1385982774619672646',
  '🔞': '1386695919675769005'
};

// ✅ Bot prêt
client.once('ready', () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
});

// 👋 Message de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return console.error("❌ Salon de bienvenue introuvable");

  const embed = new EmbedBuilder()
    .setTitle(`🎉 Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

  try {
    await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  } catch (err) {
    console.error("❌ Erreur en envoyant le message de bienvenue :", err);
  }
});

// 🎯 Commande !autorole
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content === '!autorole') {
    if (message.channel.id !== autoroleChannelId) return;

    const embed = new EmbedBuilder()
      .setTitle('🎯 Choisis tes jeux préférés !')
      .setDescription(`Clique sur les réactions pour recevoir un rôle :

**🔫 Valorant**  
**💥 Fortnite**  
**🚀 Rocket League**  
**🎮 Autres jeux**  
**🔞 Salon trash**

💡 N’hésite pas à proposer d’autres jeux dans le salon discussions.`)
      .setColor(0x5865F2);

    const msg = await message.channel.send({ embeds: [embed] });

    for (const emoji of Object.keys(rolesMap)) {
      await msg.react(emoji);
    }

    client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) return;

      if (reaction.message.id === msg.id && rolesMap[reaction.emoji.name]) {
        const role = message.guild.roles.cache.get(rolesMap[reaction.emoji.name]);
        const member = message.guild.members.cache.get(user.id);
        if (role && member) await member.roles.add(role).catch(console.error);
      }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) return;

      if (reaction.message.id === msg.id && rolesMap[reaction.emoji.name]) {
        const role = message.guild.roles.cache.get(rolesMap[reaction.emoji.name]);
        const member = message.guild.members.cache.get(user.id);
        if (role && member) await member.roles.remove(role).catch(console.error);
      }
    });
  }
});

// 📜 Commande !reglement
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content === '!reglement') {
    if (message.channel.id !== reglementChannelId) return;

    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du Serveur Discord')
      .setColor(0x3498db)
      .setDescription(`**🤝 Respect et Bienveillance**  
Le respect entre membres est obligatoire.  
Pas d’insultes, harcèlement ou propos haineux.  

**🗣️ Comportement et Langage**  
Utilise un langage approprié, pas de spam ou pub.  
Reste poli même en cas de désaccord.  

**📌 Sujets sensibles**  
Évite les discussions politiques/religieuses.  
Pas de contenu NSFW (même en MP sans accord).  

**📣 Publicité et Partages**  
Pas de pub sans autorisation.  
Les liens doivent être sûrs.  

**🛠️ Utilisation des salons**  
Respecte les thèmes de chaque salon.  
Ne ping pas pour rien.  

**👑 Staff et Sanctions**  
Le staff est là pour aider.  
Respecte leurs décisions.  
Les sanctions peuvent aller du mute au ban.`);

    const bouton = new ButtonBuilder()
      .setCustomId('accept_rules')
      .setLabel('Valider')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('<:apple_success:1387148694230667448>');

    const row = new ActionRowBuilder().addComponents(bouton);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ✅ Attribution du rôle après clic
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'accept_rules') {
    await interaction.member.roles.add(membreRoleId).catch(console.error);
    await interaction.reply({ content: '✅ Règlement accepté, tu as maintenant accès au serveur !', ephemeral: true });
  }
});

// 🔐 Connexion
client.login(process.env.TOKEN);
