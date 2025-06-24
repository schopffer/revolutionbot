const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot en ligne !'));
app.listen(3000, () => console.log('🟢 Web server actif !'));

const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, Partials, InteractionType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ID du salon #bienvenue
const welcomeChannelId = '1385999517983440967';
// ID du salon des rôles
const rolesChannelId = '1385943465321566289';

client.once('ready', async () => {
  console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

  // Enregistrement de la commande slash localement
  const commands = [
    new SlashCommandBuilder()
      .setName('autorole')
      .setDescription('Affiche les rôles que les membres peuvent choisir')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Commande /autorole enregistrée');
  } catch (error) {
    console.error('❌ Erreur lors de l'enregistrement des commandes slash :', error);
  }
});

// Message de bienvenue
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

// Gestion de la commande /autorole
client.on('interactionCreate', async interaction => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;

  if (interaction.commandName === 'autorole') {
    const embed = new EmbedBuilder()
      .setTitle('🎯 Choisis tes jeux préférés')
      .setDescription(`🔫 Valorant
💥 Fortnite
🚀 Rocket League
🎮 Autres jeux
🔞 Salon trash`)
      .setColor(0xffc107)
      .setFooter({ text: 'Clique sur une réaction pour obtenir un rôle !' });

    try {
      const message = await interaction.reply({ content: 'Choisissez vos rôles ici :', embeds: [embed], fetchReply: true });
      await message.react('🔫');
      await message.react('💥');
      await message.react('🚀');
      await message.react('🎮');
      await message.react('🔞');
    } catch (err) {
      console.error('❌ Erreur lors de l'envoi des rôles interactifs :', err);
    }
  }
});

client.login(process.env.TOKEN);

