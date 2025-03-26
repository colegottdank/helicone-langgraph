// graph-visualization.ts
// This script visualizes our agent's graph structure

import { writeFileSync } from "node:fs";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

// Define a simplified model to avoid API key requirements for visualization
const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
});

// Define the tools for the agent to use
const tools = [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

// Define our graph exactly the same as in agent.ts
function shouldContinue({ messages }: any) {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

async function callModel(state: any) {
  // This is just for visualization - we don't actually call the model
  return { messages: [] };
}

// Define a new graph with same structure as our agent.ts
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

async function generateGraphVisualization() {
  try {
    // Compile the graph
    const app = workflow.compile();

    // Get the graph visualization
    const graph = app.getGraph();
    const mermaidGraph = await graph.getMermaidCode();

    // Write the mermaid code to file
    writeFileSync("graph.mermaid", mermaidGraph, "utf-8");
    console.log("Graph visualization saved to graph.mermaid");

    // Try to generate PNG visualization too if possible
    try {
      const graphImage = await graph.drawMermaidPng();
      const graphArrayBuffer = await graphImage.arrayBuffer();

      writeFileSync("graph.png", new Uint8Array(graphArrayBuffer));
      console.log("Graph PNG visualization saved to graph.png");
    } catch (err) {
      console.log(
        "Could not generate PNG visualization. Mermaid code is still available."
      );
    }
  } catch (error) {
    console.error("Error generating graph visualization:", error);
  }
}

generateGraphVisualization();
