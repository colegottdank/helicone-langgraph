# Deploying to LangGraph Cloud & Using LangGraph Studio

This guide walks through the process of deploying this agent to LangGraph Cloud and using LangGraph Studio for visual editing and monitoring.

## Prerequisites

1. A [LangSmith](https://smith.langchain.com/) account (free or paid tier)
2. A GitHub account
3. Your API keys for OpenAI, Helicone, and Tavily

## Step 1: Push Your Code to GitHub

1. Create a new GitHub repository
2. Push your code to the repository
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/helicone-langgraph.git
   git push -u origin main
   ```

## Step 2: Deploy to LangGraph Cloud

1. Log in to [LangSmith](https://smith.langchain.com/)
2. Click on **LangGraph Platform** in the left sidebar
   - Note: You may need a LangSmith Plus, Premier, Startup, or Enterprise plan to access LangGraph Platform
3. Click on the **+ New Deployment** button in the top right corner
4. Click on **Import from GitHub** (if this is your first time)
5. Select your repository from the list
6. Configure Environment Variables:
   - Add `OPENAI_API_KEY`, `HELICONE_API_KEY`, and `TAVILY_API_KEY` as secrets
7. Click **Submit** to deploy your application

## Step 3: Using LangGraph Studio

Once your application is deployed:

1. From the LangGraph Platform deployments page, click on your deployment name
2. Click the **LangGraph Studio** button to open the visual interface
3. In LangGraph Studio, you can:
   - View your agent's graph structure visually
   - Test your agent with different inputs
   - Inspect the state at each step of execution
   - Debug by examining what happens at each node
   - Export visualizations of your graph

## Step 4: Testing the API

Your deployed agent will have a REST API with the endpoints defined in `langgraph.yaml`:

1. Navigate to the **API Keys** tab in your deployment
2. Create a new API key
3. Use the generated key to authenticate API requests:

```bash
# Example of calling your deployed API
curl -X POST \
  https://api.smith.langchain.com/langgraph-apps/[YOUR_APP_ID]/invoke \
  -H "Authorization: Bearer [YOUR_API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "human", "content": "What is the weather in San Francisco?"}]}'
```

## Monitoring and Analytics

1. In LangSmith, you can track all executions of your deployed agent
2. In Helicone, you can monitor API usage, costs, and performance metrics

## Making Updates

To update your deployed agent:

1. Make changes to your code locally
2. Commit and push to GitHub
3. In LangGraph Platform, click on your deployment and select **Redeploy**
