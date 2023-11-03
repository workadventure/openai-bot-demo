import {RemotePlayerInterface} from "@workadventure/iframe-api-typings/front/Api/Iframe/Players/RemotePlayer";
import {z} from "zod";


export function findPeopleByPlace(): Map<string|undefined, Array<RemotePlayerInterface>> {
    const players = WA.players.list();

    // TODO: deduplicate users name. If 2 users have the same name, let's rename one.

    const peopleByPlace = new Map<string|undefined, Array<RemotePlayerInterface>>();

    for (const player of players) {
        const placeResult = z.string().optional().safeParse(player.state.currentPlace);
        if (placeResult.success === false) {
            console.warn("Invalid place for a player: ", player.state.currentPlace);
            continue;
        }
        const place = placeResult.data ?? "corridor";

        let people = peopleByPlace.get(place);
        if (people === undefined) {
            people = [];
            peopleByPlace.set(place, people);
        }
        people.push(player);
    }

    return peopleByPlace;
}


export function generatePeopleByPlacesPrompt(): string {
    const peopleByPlace = findPeopleByPlace();

    let prompt = "In your map, you can find the following people:\n\n";

    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

    for (const [place, people] of peopleByPlace.entries()) {
        prompt += `- ${formatter.format(people.map(person => person.name))} ${people.length === 1 ? "is" : "are"} in ${place}\n`;
    }

    return prompt;
}

export function isTeamMember(player: RemotePlayerInterface): boolean {
    const tagsResult = z.string().array().optional().safeParse(player.state.tags);
    if (!tagsResult.success) {
        console.warn("Invalid tags for a player: ", player.state.tags);
        return false;
    }
    const tags = tagsResult.data ?? [];

    return tags.includes("member");
}

export function findPeopleByRole(): {
    "visitors": Array<RemotePlayerInterface>,
    "coworkers": Array<RemotePlayerInterface>,
} {
    const players = WA.players.list();
    // TODO: deduplicate users name. If 2 users have the same name, let's rename one.

    const visitors = new Array<RemotePlayerInterface>();
    const coworkers = new Array<RemotePlayerInterface>();

    for (const player of players) {
        if (isTeamMember(player)) {
            coworkers.push(player);
        } else {
            visitors.push(player);
        }
    }

    return {
        visitors,
        coworkers,
    }
}

export function generatePeopleByRolePrompt(): string {
    const peopleByRole = findPeopleByRole();

    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

    const coworkers = peopleByRole['coworkers'];
    const visitors = peopleByRole['visitors'];

    let prompt = '';

    if (coworkers.length === 0) {
        prompt = "No one from your team is in this map.\n";
    } else if (coworkers.length === 1) {
        prompt = `${coworkers[0].name} is a coworker. He/she is part of your team.\n`;
    } else {
        prompt = `${formatter.format(peopleByRole['coworkers'].map(person => person.name))} are coworkers. They are part of your team and work in this map.\n`;
    }

    if (visitors.length === 0) {
        prompt = "There are no visitors in this map.\n";
    } else if (visitors.length === 1) {
        prompt = `${visitors[0].name} is a visitor.\n`;
    } else {
        prompt = `${formatter.format(peopleByRole['visitors'].map(person => person.name))} are visitors.\n`;
    }

    return prompt;
}
