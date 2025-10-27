import { IAgentRequest } from "./agent.interface";
import { AgentRequestModel } from "./agent.model";

const agentRequest = async (payload: IAgentRequest) => {
  const data = await AgentRequestModel.create(payload);
  return data;
};

const getAllAgentRequests = async () => {
  const data = await AgentRequestModel.find();
  return data;
};

export const AgentService = { agentRequest, getAllAgentRequests };
