require('dotenv').config();
const OpenAI = require('openai');
const readlineSync = require('readline-sync');

// Open AI configuration
const openai = new OpenAI();
let messages = [
    { role: "system", content: "You are a professional assistant" },
]


// Get user input
function getInput(promptMessage) {
    return readlineSync.question(promptMessage, {
        hideEchoBack: false, // The typed characters won't be displayed if set to true
    });
}

async function main() {
    console.log('\n\n----------------------------------');
    console.log('          CHAT WITH AI 🤖   ');
    console.log('----------------------------------\n');
    console.log("type 'x' to exit the conversation");
    runConversation();
}

async function getWeather(latitude, longitude) {

    //console.log("url: " + `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}`);

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.WEATHER_API_KEY}`);
    const data = await response.json();

    const currentTemp = data.main.temp;
    const description = data.weather[0].description;

    const weatherInfo = {
        location: data.name,
        temperature: Math.round(currentTemp - 273.15),
        forecast: description,
    };

    return weatherInfo;
}


async function runConversation() {
    try {
        const tools = [{
            type: "function",
            function: {
                name: "get_weather",
                description: "Get current temperature for provided coordinates in celsius.",
                parameters: {
                    type: "object",
                    properties: {
                        latitude: { type: "number" },
                        longitude: { type: "number" }
                    },
                    required: ["latitude", "longitude"],
                    additionalProperties: false
                },
                strict: true
            }
        }];

        while (true) {
            const input = getInput('You: ');
            if (input === 'x') {
                console.log("Goodbye!");
                process.exit();
            }
            messages.push({ role: "user", content: input });

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                tools,
                store: true,
            });

            //console.log(completion.choices[0].message.tool_calls);
            if (!completion.choices[0].message.tool_calls) {
                console.log(`Bot: ${completion.choices[0].message.content}`);
                continue;
            }

            messages.push(completion.choices[0].message);

            const toolCalls = completion.choices[0].message.tool_calls;

            for (const toolCall of toolCalls) {

                const args = JSON.parse(toolCall.function.arguments);

                const result = await getWeather(args.latitude, args.longitude);

                messages.push({                               // append result message
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });

                //console.log(`Bot: The temperature in ${city} is ${temperature} degrees celcius with ${weather} `);

                const completion2 = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages,
                    tools,
                    store: true,
                });

                console.log(`Bot: ${completion2.choices[0].message.content}`);

            }
        }
    } catch (e) {
        console.log(e);
        console.error(e);
    }

}




main();