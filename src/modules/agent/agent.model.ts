import { model, Schema } from "mongoose";
import { IAgentRequest } from "./agent.interface";

const AgentRequestSchema = new Schema<IAgentRequest>(
  {
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const AgentRequestModel = model<IAgentRequest>(
  "Agent_Request",
  AgentRequestSchema
);
