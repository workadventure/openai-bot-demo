import {generatePlacesPrompt} from "./places";
import {generatePeopleByPlacesPrompt, generatePeopleByRolePrompt} from "./people";


export async function getMovePrompt(): Promise<string> {
    return `You are a bot living in a WorkAdventure map.
Your job is to welcome visitors. In priority, you should welcome visitors entering the lobby.

${await generatePlacesPrompt()}
${generatePeopleByPlacesPrompt()}
${generatePeopleByRolePrompt()}

Please tell me who you are going to greet.
You should answer in the format "Go to <name>" where <name> is the name of the person you are greeting.
Please answer only this and nothing else.
    `;
}

