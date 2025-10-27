import { model, Schema } from "mongoose";
import { AgentRequestStatus, IAgentRequest } from "./agent.interface";

const AgentRequestSchema = new Schema<IAgentRequest>(
  {
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: {
        values: Object.values(AgentRequestStatus),
        message: "{VALUE} is not acceptable",
      },
      default: AgentRequestStatus.PENDING,
    },
  },
  { timestamps: true, versionKey: false }
);

export const AgentRequestModel = model<IAgentRequest>(
  "Agent_Request",
  AgentRequestSchema
);
