// 🌐 Express pour hébergement Render
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Serveur web actif'));

// 📦 Modules Discord.js
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes,
  Events,
  PermissionsBitField
} = require('discord.js');

// 🤖 Client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// 🔢 IDs personnalisés
const GUILD_ID = '1385409088263028939';
const welcomeChannelId = '1385999517983440967';
const reglementChannelId = '1385409088824938652';
const choixRoleChannelId = '1385943465321566289';
const membreRoleId = '1385627871023861820';
const logChannelId = '1385651948094623865';

// 🎮 Rôles par emoji
const roles = {
  '🔫': '1385980913728487455',
  '💥': '1386063811907162183',
  '🚀': '1385983179034202112',
  '🎮': '1385982774619672646',
  '🔞': '1386695919675769005'
};

// ✅ Slash commands registration
client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder().setName('autorole').setDescription('Afficher les rôles disponibles'),
    new SlashCommandBuilder().setName('reglement').setDescription('Afficher le règlement du serveur'),
    new SlashCommandBuilder().setName('help').setDescription('Afficher la liste des commandes disponibles'),
    new SlashCommandBuilder().setName('ban').setDescription('Bannir un membre').addUserOption(option =>
      option.setName('membre').setDescription('Membre à bannir').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('Expulser un membre').addUserOption(option =>
      option.setName('membre').setDescription('Membre à expulser').setRequired(true)),
    new SlashCommandBuilder().setName('mute').setDescription('Rendre un membre muet').addUserOption(option =>
      option.setName('membre').setDescription('Membre à rendre muet').setRequired(true)),
    new SlashCommandBuilder().setName('unban').setDescription('Débannir un membre').addStringOption(option =>
      option.setName('userid').setDescription("ID du membre à débannir").setRequired(true))
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands enregistrées');
  } catch (err) {
    console.error('❌ Erreur enregistrement slash commands :', err);
  }
});

// 👋 Message de bienvenue avec GIF One Piece
const gifsBienvenue = [
  'https://media.giphy.com/media/q8ld8Sk7WWyY0/giphy.gif',
  'https://media.giphy.com/media/9az09tlYyYNfq/giphy.gif',
  'https://media.giphy.com/media/PoK3zuKMTYqNUFFbaG/giphy.gif',
  'https://media.giphy.com/media/A8v23NdA9fGZW/giphy.gif',
  'https://media.giphy.com/media/13Uqp5IGFpmDle/giphy.gif'
];

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const gifChoisi = gifsBienvenue[Math.floor(Math.random() * gifsBienvenue.length)];

  const embed = new EmbedBuilder()
    .setTitle(`Bienvenue ${member.user.username} !`)
    .setColor(0x00AE86)
    .setFooter({ text: 'Amuse-toi bien sur le serveur ! 🌟' });

  await channel.send({
    content: `<@${member.id}>\n${gifChoisi}`,
    embeds: [embed]
  });
});

// 📦 Interaction Handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (commandName === 'autorole') {
      if (interaction.channel.id !== choixRoleChannelId) {
        return interaction.reply({ content: '❌ Utilise cette commande dans le salon autorole.', ephemeral: true });
      }

      await interaction.reply({ content: '📩 Menu autorole envoyé dans ce salon.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('🎯 Choisis tes jeux préférés !')
        .setColor(0x3498db)
        .setDescription(`
Réagis avec un émoji pour recevoir un rôle :

> 🔫 ・ **Valorant**
> 💥 ・ **Fortnite**
> 🚀 ・ **Rocket League**
> 🎮 ・ **Autres jeux**
> 🔞 ・ **Salon Trash**

💡 N’hésite pas à proposer d’autres jeux dans le salon discussions si tu veux qu’on les ajoute.
        `)
        .setFooter({ text: 'Clique sur un émoji ci-dessous pour recevoir ou retirer un rôle.' });

      const msg = await interaction.channel.send({ embeds: [embed] });
      for (const emoji of Object.keys(roles)) await msg.react(emoji);
    }

    if (commandName === 'reglement') {
      await interaction.reply({ content: '📩 Règlement envoyé dans ce salon.', ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle('📜 Règlement du Serveur')
        .setColor(0x3498db)
        .setDescription(`
**🤝 Respect** : soyez bienveillant.
**🗣️ Langage** : pas de spam, pub, propos haineux.
**📌 Sujets sensibles** : pas de politique, religion, NSFW.
**📢 Publicité** : interdite sans accord.
**🛠️ Utilisation des salons** : respectez les thèmes.
**👑 Staff** : respect des décisions.
        `);

      const bouton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('accepte_reglement')
          .setLabel('Valider le règlement')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('☑️')
      );

      await interaction.channel.send({ embeds: [embed], components: [bouton] });
    }

    if (commandName === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('📚 Commandes disponibles')
        .setColor(0x00bfff)
        .setDescription(`
• /autorole : afficher les rôles disponibles
• /reglement : afficher le règlement
• /ban : bannir un membre (admin seulement)
• /kick : expulser un membre (admin seulement)
• /mute : rendre un membre muet (admin seulement)
• /unban : débannir un membre (admin seulement)
        `);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === 'ban') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission de bannir.', ephemeral: true });
      }
      const user = interaction.options.getUser('membre');
      const member = interaction.guild.members.cache.get(user.id);
      if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

      await member.ban();
      await interaction.reply({ content: `🔨 <@${user.id}> a été banni.` });
    }

    if (commandName === 'kick') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission d’expulser.', ephemeral: true });
      }
      const user = interaction.options.getUser('membre');
      const member = interaction.guild.members.cache.get(user.id);
      if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

      await member.kick();
      await interaction.reply({ content: `🦶 <@${user.id}> a été expulsé.` });
    }

    if (commandName === 'mute') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission de mute.', ephemeral: true });
      }
      const user = interaction.options.getUser('membre');
      const member = interaction.guild.members.cache.get(user.id);
      if (!member) return interaction.reply({ content: '❌ Membre introuvable.', ephemeral: true });

      const timeoutDuration = 24 * 60 * 60 * 1000;
      await member.timeout(timeoutDuration, 'Mute par commande modérateur');
      await interaction.reply({ content: `🔇 <@${user.id}> a été rendu muet pendant 24h.` });
    }

    if (commandName === 'unban') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return interaction.reply({ content: '❌ Tu n’as pas la permission de débannir.', ephemeral: true });
      }

      const userId = interaction.options.getString('userid');

      try {
        await interaction.guild.members.unban(userId);
        await interaction.reply({ content: `🔓 L'utilisateur avec l'ID \`${userId}\` a été débanni.` });
      } catch (error) {
        console.error("❌ Erreur unban :", error);
        await interaction.reply({ content: `❌ Impossible de débannir l'utilisateur avec l'ID \`${userId}\`.` });
      }
    }
  }

  if (interaction.isButton() && interaction.customId === 'accepte_reglement') {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    await member.roles.add(membreRoleId);
    await interaction.reply({ content: '✅ Règlement accepté. Rôle attribué.', ephemeral: true });
  }
});

// 🎭 Gestion des rôles via réactions
async function handleReaction(reaction, user, add = true) {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (user.bot) return;

    if (reaction.message.channelId !== choixRoleChannelId) return;

    const roleId = roles[reaction.emoji.name];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (add) {
      await member.roles.add(roleId);
    } else {
      await member.roles.remove(roleId);
    }
  } catch (err) {
    console.error("❌ Erreur rôle via réaction :", err);
  }
}

client.on('messageReactionAdd', (reaction, user) => handleReaction(reaction, user, true));
client.on('messageReactionRemove', (reaction, user) => handleReaction(reaction, user, false));

// 📑 LOGS EMBEDS
client.on('guildBanAdd', async (guild, user) => {
  const logChannel = guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  const embed = new EmbedBuilder()
    .setTitle('🔨 Membre banni')
    .setColor(0xff0000)
    .addFields(
      { name: 'Utilisateur', value: `${user.tag} (\`${user.id}\`)` },
      { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
    );
  logChannel.send({ embeds: [embed] });
});

client.on('guildBanRemove', async (guild, user) => {
  const logChannel = guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  const embed = new EmbedBuilder()
    .setTitle('🔓 Membre débanni')
    .setColor(0x00ff00)
    .addFields(
      { name: 'Utilisateur', value: `${user.tag} (\`${user.id}\`)` },
      { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
    );
  logChannel.send({ embeds: [embed] });
});

client.on('messageDelete', async message => {
  const logChannel = message.guild.channels.cache.get(logChannelId);
  if (!logChannel || !message.content || message.author?.bot) return;
  const embed = new EmbedBuilder()
    .setTitle('🗑️ Message supprimé')
    .setColor(0x808080)
    .addFields(
      { name: 'Auteur', value: `${message.author.tag} (\`${message.author.id}\`)` },
      { name: 'Contenu', value: message.content.substring(0, 1000) },
      { name: 'Salon', value: `<#${message.channel.id}>` },
      { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
    );
  logChannel.send({ embeds: [embed] });
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
  const logChannel = newMsg.guild.channels.cache.get(logChannelId);
  if (!logChannel || oldMsg.content === newMsg.content) return;
  const embed = new EmbedBuilder()
    .setTitle('✏️ Message modifié')
    .setColor(0xffff00)
    .addFields(
      { name: 'Auteur', value: `${newMsg.author.tag} (\`${newMsg.author.id}\`)` },
      { name: 'Avant', value: oldMsg.content.substring(0, 1000) || 'vide' },
      { name: 'Après', value: newMsg.content.substring(0, 1000) || 'vide' },
      { name: 'Salon', value: `<#${newMsg.channel.id}>` },
      { name: 'Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
    );
  logChannel.send({ embeds: [embed] });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const logChannel = newMember.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;
  const embeds = [];

  if (oldMember.nickname !== newMember.nickname) {
    const embed = new EmbedBuilder()
      .setTitle('📝 Changement de pseudo')
      .setColor(0x00ced1)
      .addFields(
        { name: 'Utilisateur', value: `${newMember.user.tag} (\`${newMember.user.id}\`)` },
        { name: 'Avant', value: oldMember.nickname || 'Aucun' },
        { name: 'Après', value: newMember.nickname || 'Aucun' }
      );
    embeds.push(embed);
  }

  const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
  const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

  if (addedRoles.size > 0 || removedRoles.size > 0) {
    const embed = new EmbedBuilder()
      .setTitle('🎭 Mise à jour des rôles')
      .setColor(0x9370db)
      .addFields(
        { name: 'Utilisateur', value: `${newMember.user.tag} (\`${newMember.user.id}\`)` },
        { name: 'Ajoutés', value: addedRoles.map(r => r.name).join(', ') || 'Aucun' },
        { name: 'Retirés', value: removedRoles.map(r => r.name).join(', ') || 'Aucun' }
      );
    embeds.push(embed);
  }

  for (const embed of embeds) logChannel.send({ embeds: [embed] });
});

// 🔐 Connexion
client.login(process.env.TOKEN);
