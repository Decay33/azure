import { AzureFunction, Context } from "@azure/functions";

const handler: AzureFunction = async (context: Context): Promise<void> => {
  context.log("Health check ping");

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      status: "ok",
      timestamp: new Date().toISOString()
    }
  };
};

export { handler };
