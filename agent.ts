// agent.ts

// Load environment variables from .env file
import * as dotenv from "dotenv";
dotenv.config();

// Verify API keys are present
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HELICONE_API_KEY = process.env.HELICONE_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!OPENAI_API_KEY || !HELICONE_API_KEY || !TAVILY_API_KEY) {
  console.error("Missing required API keys. Please check your .env file.");
  console.error(
    "Required keys: OPENAI_API_KEY, HELICONE_API_KEY, TAVILY_API_KEY"
  );
  process.exit(1);
}

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
// Helicone is integrated via the OpenAI configuration, not as a separate import

// Define the tools for the agent to use
const tools = [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

// Create a model with Helicone integration via proxy
const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  openAIApiKey: OPENAI_API_KEY,
  configuration: {
    baseURL: "https://oai.hconeai.com/v1", // Helicone proxy URL
    headers: {
      "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
    },
  },
}).bindTools(tools);

// Define the function that determines whether to continue or not
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1];

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  // Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
}

// Define the function that calls the model
async function callModel(state: typeof MessagesAnnotation.State) {
  // We can add custom headers for this specific request
  // This will be tracked in Helicone automatically
  const response = await model.invoke(state.messages, {
    headers: {
      "Helicone-Property-Node": "agent_decision",
      "Helicone-Property-Request-Type": "reasoning",
    },
  });

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Finally, we compile it into a LangChain Runnable.
const app = workflow.compile();

async function runAgent() {
  try {
    console.log("Running first query...");
    // Use the agent with Helicone tracking
    const finalState = await app.invoke(
      {
        messages: [new HumanMessage("what is the weather in sf")],
      },
      {
        configurable: {
          headers: {
            "Helicone-Property-Session": "weather_query_sf",
          },
        },
      }
    );

    console.log(finalState.messages[finalState.messages.length - 1].content);

    console.log("\nRunning follow-up query...");
    const nextState = await app.invoke(
      {
        // Including the messages from the previous run gives the LLM context
        messages: [...finalState.messages, new HumanMessage("what about ny")],
      },
      {
        configurable: {
          headers: {
            "Helicone-Property-Session": "weather_query_ny",
          },
        },
      }
    );

    console.log(nextState.messages[nextState.messages.length - 1].content);
  } catch (error) {
    console.error("Error running agent:", error);
  }
}

// Export the graph for LangGraph Cloud deployment
export { app };

// Only run the agent directly if this file is executed directly
if (require.main === module) {
  runAgent();
}
