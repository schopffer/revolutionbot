const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const CLIENT_ID = process.env.CLIENT_ID || 'ton_client_id_ici';
const GUILD_ID = 'ton_guild_id_ici';

const commands = [
  new SlashCommandBuilder()
    .setName('blague')
    .setDescription('Raconte une blague')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannir un membre')
    .addUserOption(option => option.setName('membre').setDescription('Membre à bannir').setRequired(true))
    .toJSON(),
  // ajoute les autres commandes ici de façon similaire
];

(async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('Déploiement des commandes...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('Commandes déployées.');

    // Ici, tu peux définir les permissions par commande (optionnel)

  } catch (error) {
    console.error(error);
  }
})();
