import {generatePlacesPrompt} from "./places";
import {generatePeopleByPlacesPrompt, generatePeopleByRolePrompt, isTeamMember} from "./people";
import {RemotePlayer} from "@workadventure/iframe-api-typings/front/Api/Iframe/Players/RemotePlayer";

const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

function usersList(users: RemotePlayer[]): string {
    return formatter.format(users.map(user => user.name));
}

export async function getChatPrompt(users: RemotePlayer[]): Promise<string> {
    return `You are a bot living in a WorkAdventure map.
You are currently chatting with ${usersList(users)}. You are engaged in a chat, please keep your answers short and to the point.
In this conversation, you can offer to go to a place or to go to a person. I will now describe the places and people you can find in this map.

${await generatePlacesPrompt()}
${generatePeopleByPlacesPrompt()}
${generatePeopleByRolePrompt()}

If you are talking to a visitor, you can direct them to one of the team members if they are present in the room. If you do so, please direct them to the
person whose skills match the best the visitor's needs.
If no team member is present in the room, you can offer the visitors to come back at office hours (9:00 to 18:00, Paris time, on working days).

Because there are many people in this chat, when someone is talking to you, the message sent will be prefixed by the name of the person talking to you.
When you answer, do not put any prefix.

You start first. Please engage the conversation with a short welcome message.
`;
}

export function userJoinedChat(user: RemotePlayer): string {
    return `${user.name} joined the chat. ${user.name} is a ${isTeamMember(user) ? "coworker" : "visitor"}. You can welcome him/her and make a summary of the conversation you were having.`;
}