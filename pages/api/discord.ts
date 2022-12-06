import { NextApiRequest, NextApiResponse } from "next";
import { EmbedBuilder, WebhookClient } from "discord.js";
import { RATE, WEBHOOK_ID, WEBHOOK_TOKEN } from "../../envs";

const id = WEBHOOK_ID;
const token = WEBHOOK_TOKEN;

const webhookClient = new WebhookClient({ id, token });

const icyEmoji = "<:ICY:1049620715374133288>";
const moneyEmoji = "<a:money:1049621199468105758>";

export default function handler(req: NextApiRequest, res: NextApiResponse<{}>) {
  const { address, value: _value, tx } = req.query;
  const value = Number(_value);
  const valueUsd = value * RATE;

  const embed = new EmbedBuilder()
    .setColor("#c2e2ec")
    .setTimestamp()
    .setDescription(
      `${Array(Math.floor(valueUsd / 20))
        .fill(icyEmoji)
        .join("")}\n\n${moneyEmoji} \`${address?.slice(
        0,
        5
      )}...${address?.slice(
        -5
      )}\` just claimed ${value} ICY for ${valueUsd} USDC\n:chains: Transaction: [Polygonscan](${tx})\n\n:robot: Head to [earn.d.foundation](https://earn.d.foundation) to see available quests and r&d topics.`
    )
    .setTitle("$ICY Swapped");

  webhookClient.send({
    username: "Mochi Bot",
    avatarURL:
      "https://media.discordapp.net/attachments/1019524376527372288/1049620806407307295/mochi.png",
    embeds: [embed],
  });

  res.status(200).json({});
}
