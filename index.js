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
    GatewayIntentBits.GuildMessageReactions
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
      option.setName('membre').setDescription('Membre à rendre muet').setRequired(true))
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

// 👋 Message de bienvenue
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

// 📦 Interaction Handler (slash + boutons)
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (commandName === 'autorole') {
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
        `)
        .setFooter({ text: 'Clique sur un émoji ci-dessous pour recevoir ou retirer un rôle.' });

      const msg = await interaction.channel.send({ embeds: [embed] });
      for (const emoji of Object.keys(roles)) await msg.react(emoji);
      await interaction.reply({ content: '📩 Menu autorole envoyé.', ephemeral: true });
    }

    if (commandName === 'reglement') {
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
      await interaction.reply({ content: '📩 Règlement affiché.', ephemeral: true });
    }

    if (commandName === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('📚 Commandes disponibles')
        .setColor(0x00bfff)
        .setDescription(`
Voici les commandes disponibles :

• /autorole : afficher les rôles disponibles
• /reglement : afficher le règlement
• /ban : bannir un membre (admin seulement)
• /kick : expulser un membre (admin seulement)
• /mute : rendre un membre muet (admin seulement)
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

      // Timeout pendant 1 jour
      const timeoutDuration = 24 * 60 * 60 * 1000; // 24h en ms
      await member.timeout(timeoutDuration, 'Mute par commande modérateur');
      await interaction.reply({ content: `🔇 <@${user.id}> a été rendu muet pendant 24h.` });
    }
  }

  if (interaction.isButton() && interaction.customId === 'accepte_reglement') {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    await member.roles.add(membreRoleId);
    await interaction.reply({ content: '✅ Règlement accepté. Rôle attribué.', ephemeral: true });
  }
});
