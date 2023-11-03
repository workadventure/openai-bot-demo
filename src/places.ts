import {getLayersMap, Properties} from "@workadventure/scripting-api-extra/dist";


let placesPromise: Promise<Map<string, string|undefined>>|undefined;

export async function findPlaces(): Promise<Map<string, string|undefined>> {
    if (placesPromise !== undefined) {
        return placesPromise;
    }

    return new Promise(async (resolve) => {
        const zones = new Map<string, string|undefined>();

        const layers = await getLayersMap();
        for (const layer of layers.values()) {
            if (layer.type === 'objectgroup') {
                for (const object of layer.objects) {
                    if (object.type === 'area' || object.class === 'area') {
                        const properties = new Properties(object.properties);
                        if (properties.getBoolean('ai-zone') === true) {
                            zones.set(object.name, properties.getString('description'));
                        }
                    }
                }
            }
        }

        resolve(zones);
    });
}

export async function generatePlacesPrompt(): Promise<string> {
    const zones = await findPlaces();

    let prompt = "In your map, you can find the following places:\n\n";

    for (const [name, description] of zones.entries()) {
        prompt += `- ${name}: ${description}\n`;
    }

    return prompt;
}

export async function updateMyPlace(): Promise<void> {
    const places = await findPlaces();
    for (const areaName of places.keys()) {
        WA.room.area.onEnter(areaName).subscribe(() => {
            WA.player.state.saveVariable('currentPlace', areaName, {
                persist: false,
                public: true,
            });
        });
    }
}
