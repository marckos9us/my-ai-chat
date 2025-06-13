# LLM Chat Application

A simple, standalone web-based chat interface for LLMs using the OpenRouter API. Built with vanilla JavaScript, HTML, and CSS.

## Features

- **Clean, Modern Interface**: Intuitive chat UI similar to popular platforms like ChatGPT and Claude
- **OpenRouter API Integration**: Access to multiple LLM models through a single interface
- **Rich Text Support**: Markdown rendering and code syntax highlighting
- **File Upload**: Add context to your prompts by uploading text files
- **Streaming Responses**: See model responses in real-time as they're generated
- **Conversation Management**: Save, load, export, and import conversations
- **Model Selection**: Choose from various models with different context windows
- **Advanced Settings**: Fine-tune model parameters like `temperature`, `top_p`, and more
- **Persistence**: Chat history stored in `localStorage` for data preservation
- **Mobile Responsive**: Works well on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- An OpenRouter API key (sign up at [OpenRouter.ai](https://openrouter.ai))
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A web server (optional for local development)

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/josephgodwinkimani/openrouter-web.git
   ```

2. Navigate to the project directory:
   ```
   cd openrouter-web
   ```

3. Open the `index.html` file in your browser or serve it with a local server

For a simple local server, you can use Python:
```
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then access the application at `http://localhost:8000`.

### Usage

1. When you first access the application, you'll be prompted to enter your OpenRouter API key
2. Select a model from the dropdown menu at the top of the screen
3. Type your message in the input field at the bottom of the screen
4. (Optional) Upload text files by clicking the paperclip icon
5. Press Enter or click the send button to submit your message
6. View the model's response as it streams in real-time

## Models

The application supports the following models from OpenRouter:

- DeepSeek V3 0324 (163,840 context)
- DeepSeek R1 (163,840 context)
- Gemini 2.0 Flash (1,048,576 context)
- DeepSeek V3 Base (163,840 context)
- DeepSeek R1 Zero (163,840 context)
- Gemma 3 27B (131,072 context)
- Qwen 2.5 VL 72B (131,072 context)
- Llama 3.2 1B (131,072 context)
- DeepSeek R1 Distill Llama 70B (128,000 context)

## Advanced Settings

The application provides numerous settings to customize model behavior:

- **Temperature**: Controls randomness (0.0 to 2.0)
- **Top P**: Controls diversity via nucleus sampling (0.0 to 1.0)
- **Top K**: Limits choice to K top tokens (0 or above)
- **Frequency Penalty**: Reduces repetition based on frequency in input (-2.0 to 2.0)
- **Presence Penalty**: Reduces repetition regardless of frequency (-2.0 to 2.0)
- **Repetition Penalty**: Reduces repetition based on token probability (0.0 to 2.0)
- **Min P**: Minimum probability relative to most likely token (0.0 to 1.0)
- **Top A**: Dynamic Top-P based on highest probability token (0.0 to 1.0)
- **Seed**: For deterministic responses
- **Max Tokens**: Maximum number of tokens to generate
- **Logprobs**: Return log probabilities of output tokens
- **Top Logprobs**: Number of most likely tokens to return at each position
- **Streaming**: Stream the response as it's generated
- **Reasoning Tokens**: Controls the amount of reasoning (thinking) tokens the model uses

## File Upload Support

The application supports uploading text-based files to provide context for your prompts. Supported file types include:

- Plain text (.txt)
- Markdown (.md)
- Code files (.js, .html, .css, .py, etc.)
- Data files (.json, .csv, etc.)

When you upload a file, its content will be appended to your prompt in a structured format.

## Managing Conversations

- **New Chat**: Start a new conversation with the current model
- **Export Chat**: Save the current conversation as a JSON file
- **Import Chat**: Load a previously exported conversation
- **Delete Chat**: Remove the current conversation from history

## Keyboard Shortcuts

- **Ctrl+Enter** / **Cmd+Enter**: Send message
- **Ctrl+N** / **Cmd+N**: New chat


All data is stored locally in your browser using `localStorage`. Your API key is stored in `sessionStorage` and is only valid for the current session.

## Security Note

This application handles API keys directly in the browser, which carries security risks as it exposes your API key to anyone inspecting the page's source code or network requests. This implementation is intended for personal use only.

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenRouter API for providing access to multiple LLM models
- Bootstrap team for the responsive design framework
- Any & all the open-source libraries used in this project

