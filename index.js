require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events } = require('discord.js');

const app = express();
app.get('/', (_, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// IDs
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const membreRoleId = '1387170961769631817';
const autoroleChannelId = '1385943465321566289';

// GIF de bienvenue
client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setImage('https://media.giphy.com/media/DSxKEQoQix9hC/giphy.gif')
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });
  await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
});

// !autorole
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content === '!autorole') {
    const msg = await message.channel.send({
      content: `🎯 **Choisis tes jeux préférés pour recevoir les notifs et pouvoir ping la commu !**\n
🔫 **Valorant**  
💥 **Fortnite**  
🚀 **Rocket League**  
🎮 **Autres jeux**  
🔞 **Salon trash**\n
💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.`,
    });

    await msg.react('🔫');
    await msg.react('💥');
    await msg.react('🚀');
    await msg.react('🎮');
    await msg.react('🔞');
  }

  // !reglement
  if (message.content === '!reglement') {
    if (message.channel.id !== reglementChannelId) return;

    const embed = new EmbedBuilder()
      .setTitle('📜 Règlement du Serveur Discord')
      .setColor(0x3498db)
      .setDescription(
        '**🤝 Respect et Bienveillance**  \n' +
        'Le respect entre membres est **obligatoire**.  \n' +
        'Pas d’insultes, harcèlement ou propos haineux.  \n\n' +

        '**🗣️ Comportement et Langage**  \n' +
        'Langage approprié, pas de spam ou pub.  \n' +
        'Reste **poli** même en cas de désaccord.  \n\n' +

        '**📌 Sujets sensibles**  \n' +
        'Évite politique, religion, contenu NSFW.  \n\n' +

        '**📢 Publicité et Partages**  \n' +
        'Pas de pub sans autorisation. Liens non nuisibles.  \n\n' +

        '**🛠️ Utilisation des salons**  \n' +
        'Respecte les thèmes, ne spam pas les pings.  \n\n' +

        '**👑 Staff et Sanctions**  \n' +
        'Respecte les décisions du staff. Contacte un modo en cas de souci.'
      );

    const button = new ButtonBuilder()
      .setCustomId('reglement-valide')
      .setLabel('Valider le règlement')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('☑️');

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// Gestion du bouton
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'reglement-valide') {
    try {
      const role = interaction.guild.roles.cache.get(membreRoleId);
      if (!role) return await interaction.reply({ content: "❌ Rôle introuvable.", ephemeral: true });

      await interaction.member.roles.add(role);
      await interaction.reply({ content: '✅ Règlement validé ! Tu as maintenant accès au serveur.', ephemeral: true });
    } catch (err) {
      console.error("Erreur bouton règlement :", err);
    }
  }
});

// Attribution des rôles par réactions
client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.channel.id !== autoroleChannelId) return;
  if (user.bot) return;

  const member = await reaction.message.guild.members.fetch(user.id);
  const roles = {
    '🔫': '1385980913728487455',
    '💥': '1386063811907162183',
    '🚀': '1385983179034202112',
    '🎮': '1385982774619672646',
    '🔞': '1386695919675769005',
  };

  const roleId = roles[reaction.emoji.name];
  if (roleId) {
    const role = reaction.message.guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role);
  }
});

client.login(process.env.TOKEN);
