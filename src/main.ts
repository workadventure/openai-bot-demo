/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";
import {updateMyPlace} from "./places";
import {robot} from "./robot";

console.log('Script started successfully');



/*async function main() {
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Say this is a test' }],
        model: 'gpt-3.5-turbo',
    });

    console.log(chatCompletion.choices);
}

main();*/

/*
You are a bot living in a WorkAdventure map.
Your job is to welcome people.

In your map, there is a kitchen, an office, a garden and a meeting room.

Currently, David and Greg are in the kitchen. Alexis and Hugo are in the office.
There is nobody in the garden and in the meeting room.

A new user, Elena enters the map.

Please tell me who you are going to greet.
You should answer in the format "Go to <name>" where <name> is the name of the person you are greeting.
Please answer only this and nothing else.

 */

// Waiting for the API to be ready
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    await bootstrapExtra();
    console.log('Scripting API Extra ready');

    // Needed to avoid a bug in FF
    // Not sure why but the iframe is not always correctly registered in the IFrameListener.
    //await new Promise(resolve => setTimeout(resolve, 1000));

    await WA.players.configureTracking({
        players: true,
        movement: true,
    });


    await updateMyPlace();

    // Let's initialize the "tags" variable to expose our tags to others
    await WA.player.state.saveVariable('tags', WA.player.tags, {
        persist: false,
        public: true,
    });

    //const zones = await generatePlacesPrompt();
    //console.log("ZONES", zones);

    if (WA.room.hashParameters.bot) {
        robot.init();
    }

    /*WA.players.onPlayerEnters.subscribe((player) => {
        console.log("PEOPLE BY ROLE", generatePeopleByRolePrompt());
    });*/

}).catch(e => console.error(e));

export {};
