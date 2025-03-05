const OpenAI = require("openai");
var readlineSync = require("readline-sync");
const fs = require("fs");
require("dotenv").config();

const openai = new OpenAI();

const LANGUAGE_MODEL = "gpt-3.5-turbo";
const LANGUAGE_MODEL_GPT4_PREVIEW = "gpt-4-turbo-preview";
const ASSISTANT_NAME = "Customer Support Assistant";
const ASSISTANT_DEFAULT_INSTRUCTIONS =
    "You are a professional assistant";

// Upload File to OpenAI
const uploadFile = async (filepath) => {
    const file = await openai.files.create({
        file: fs.createReadStream(filepath),
        purpose: "assistants",
    });

    //console.log(file);
    //console.log(file.id);

    return file;
}

// Step 1: Create an Assistant
const createAssistant = async (file_id) => {
    console.log("file id")
    console.log(file_id);
    const assistant = await openai.beta.assistants.create({
        name: ASSISTANT_NAME,
        description: ASSISTANT_DEFAULT_INSTRUCTIONS,
        model: LANGUAGE_MODEL,
        tools: [{ "type": "code_interpreter" }],
        tool_resources: {
            "code_interpreter": {
                "file_ids": [file_id]
            }
        }
    });
    return assistant
}


// Step 2: Create a Thread
const createThread = async () => {
    const thread = await openai.beta.threads.create();

    return thread;
}


// Step 3: Add a Message to a Thread
const addMessageToThread = async (thread_id, user_input) => {
    const threadMessages = await openai.beta.threads.messages.create(
        thread_id,
        { role: "user", content: user_input }
    );

    console.log(threadMessages.content[0].text.value);
}


// Step 4: Run the Assistant
const runThread = async (thread_id, assistant_id) => {
    const run = await openai.beta.threads.runs.create(
        thread_id,
        { assistant_id: assistant_id }
    );
    //console.log("this is the run obj" + run);

    return run;
}


// Step 5: Check the Run Status
const checkRunStatus = async (thread, run) => {

    //("This is the run status: " + run.status);
    return await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
    );

}


// Step 6: Retrieve and display the Messages
const retrieveMessages = async (run, thread) => {
    if (run.status === "completed") {
        const messages = await openai.beta.threads.messages.list(thread.id);

        console.log("assistant: ", messages.data[0].content[0].text.value);
    }
}



function getInput(promptMessage) {
    return readlineSync.question(promptMessage, {
        hideEchoBack: false, // The typed characters won't be displayed if set to true
    });
}

async function main() {
    console.log("\n\n----------------------------------");
    console.log("           🤖 AI ASSISTANT           ");
    console.log("---------------------------------- \n ");
    console.log("to exit Chat type 'X'");

    // Step 0: Create a File
    const file = await uploadFile("files/faq_abc.txt");

    // Step 1: Create an Assistant
    const assistant = await createAssistant(file.id);
    // Step 2: Create a Thread
    const thread = await createThread();


    while (true) {
        // Step 3: Add a Message to a Thread
        const userMessage = getInput("You: ");
        if (userMessage.toUpperCase() === "X") {
            console.log("Goodbye!");
            process.exit();
        }

        //console.log("userMessage: ", userMessage)

        if (!!userMessage) {
            await addMessageToThread(thread.id, userMessage);
        }

        // Step 4: Run the Assistant
        let run = await runThread(thread.id, assistant.id);

        // Step 5: Check the Run Status
        while (run.status !== "completed") {
            await checkRunStatus(thread, run);
            run = await openai.beta.threads.runs.retrieve(thread.id, run.id);

            if (run.status === "failed" || run.status === "expired") {
                console.log("Chat terminated.");
                break;
                process.exit();
            }
            //await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Step 6: Retrieve and display the Messages
        await retrieveMessages(run, thread);

    }
}

main();