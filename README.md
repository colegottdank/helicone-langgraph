# LangGraph with Helicone Integration Example

This project demonstrates how to build a simple AI agent using LangGraph with Helicone integration for LLM API call monitoring.

## What is LangGraph?

LangGraph is a framework for building stateful, multi-actor applications with LLMs. It allows you to:

- Create complex workflows that involve cycles and multiple steps
- Maintain state across conversational turns
- Coordinate tools and agents in a structured way
- Build production-ready, observable AI applications

## What is Helicone?

Helicone is an observability platform for LLM applications that helps you monitor, understand and optimize your AI agents. With Helicone, you can:

- Track API usage and costs
- Monitor latency and performance
- Debug agent behavior
- Get insights into user interactions

## Project Structure

- `agent.ts` - The main LangGraph agent implementation with Helicone integration
- `graph-visualization.ts` - A utility to visualize the agent's graph structure

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and add your API keys:
   ```
   cp .env.example .env
   ```
4. Edit `.env` and add your:
   - OpenAI API key
   - Helicone API key
   - Tavily API key (for search capabilities)

## Deployment Options

### Local Development

1. Start the agent:

   ```
   npm run start
   ```

2. Generate a visual representation of the agent's graph:
   ```
   npm run visualize
   ```

### LangGraph Studio & Cloud Deployment

This project can be deployed to LangGraph Cloud, which provides:

- Visual editing with LangGraph Studio
- Scalable infrastructure
- Built-in persistence
- API endpoints
- Monitoring and analytics

For detailed instructions on deploying to LangGraph Cloud and using LangGraph Studio, see [DEPLOYMENT.md](DEPLOYMENT.md).

## How It Works

This example creates a simple agent that can:

1. Answer questions directly
2. Search the web for information using Tavily
3. Track all LLM calls through Helicone

The agent is structured as a graph with nodes for decision-making and tool usage, connected by edges that define the flow of execution.

## Helicone Integration Details

This example demonstrates how to integrate Helicone with LangGraph using OpenAI's proxy approach:

1. **API Proxy** - Route OpenAI calls through Helicone's proxy URL:

   ```typescript
   const model = new ChatOpenAI({
     configuration: {
       baseURL: "https://oai.hconeai.com/v1", // Helicone proxy URL
       headers: {
         "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
       },
     },
   });
   ```

2. **Request Properties** - Add custom tracking properties via headers:

   ```typescript
   // Global properties in model configuration
   headers: {
     "Helicone-Property-Session": "langgraph-demo",
     "Helicone-Property-App": "weather-agent",
     "Helicone-User-Id": "example-user-123"
   }

   // Per-request properties
   const response = await model.invoke(messages, {
     headers: {
       "Helicone-Property-Node": "agent_decision"
     }
   });
   ```

3. **Session Tracking** - Group related requests using session properties:
   ```typescript
   await app.invoke(messages, {
     configurable: {
       headers: {
         "Helicone-Property-Session": "weather_query_sf",
       },
     },
   });
   ```

## Further Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)
- [Helicone Documentation](https://docs.helicone.ai/)
- [LangChain Documentation](https://js.langchain.com/)
