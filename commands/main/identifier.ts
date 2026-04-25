import { SlashCommandBuilder, MessageFlags, Encoding, ChatInputCommandInteraction, SlashCommandStringOption } from "discord.js";
import * as database from "../../databaseManager.js";
import { platforms } from "../../platformEntries.js";


export const data = new SlashCommandBuilder().setName("identifier").setDescription("Set or display your identifier for a specific platform");
const platformStrings = new SlashCommandStringOption().setRequired(true).setName("platform").setDescription("The platform you're interested in");

for (var platformEntry in platforms) {
	const platform = platforms[platformEntry]!;
	platformStrings.addChoices({ name: `${platform.display}`, value: `${platform.display}` });
}

const getSubcommand = data.addSubcommand(command =>
	command.setName("get").
		setDescription("Display your identifier for a platform").
		addStringOption(platformStrings));

const setSubcommand = data.addSubcommand(command =>
	command.setName("set").
		setDescription("Set your identifier for a platform").
		addStringOption(platformStrings)
		.addStringOption(newIdentifier =>
			newIdentifier.setRequired(true)
				.setName("identifier")
				.setDescription("The new identifier for your chosen platform")
		));

export async function execute(interaction: ChatInputCommandInteraction) {
	const userData = database.GetUserData(interaction.user.id);
	const platform = interaction.options.getString("platform", true);

	if (interaction.options.getSubcommand() === "get") {
		if (userData !== null && userData[platform] === undefined) {
			await interaction.reply({ content: `You have no identifier attached for ${platform}!`, flags: MessageFlags.Ephemeral });
			return;
		}

		await interaction.reply({ content: `${platform} Identifier: ${userData[platform]}`, flags: MessageFlags.Ephemeral });
		return;
	}

	// It was a set in this case
	const givenIdentifier = interaction.options.getString("identifier", true);
	const validatorResult = platforms[platform]?.validator(givenIdentifier);

	if (validatorResult === true) {
		database.SetUserData(interaction.user.id, platform, givenIdentifier);
		await interaction.reply({ content: `Successfully set your ${platforms[platform]?.display} identifier to ${givenIdentifier}!`, flags: MessageFlags.Ephemeral });
		return;
	}

	await interaction.reply({ content: `An error occured: ${validatorResult}`, flags: MessageFlags.Ephemeral });
};