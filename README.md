# AI Assistant

An AI assistant built using native OpenAI APIs in Node.js, enabling dynamic file uploads, threaded conversations, and automated query handling.

## Features
- **Dynamic File Uploads**: Supports uploading files for AI processing.
- **Threaded Conversations**: Maintains context across multiple interactions.
- **Automated Query Handling**: Handles user queries efficiently with AI-generated responses.
- **File-Based Search**: Leverages OpenAI's Assistants File Search to retrieve information from uploaded documents.
- **Function Calling**: Uses OpenAI’s Assistants Function Calling to fetch real-time data via external APIs.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/kethansrinivas9/Gen-AI-Chat-and-Weather-Assistant.git
   cd ai-assistant
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   WEATHER_API_KEY=your_weather_api_key
   ```

4. Start the application:
   ```sh
   npm start
   ```

## Usage
- Upload files to the assistant for document-based queries.
- Engage in threaded conversations where the AI maintains context.
- Execute real-time API calls through function calling.

## Technologies Used
- Node.js
- OpenAI API

## License
This project is licensed under the MIT License.
