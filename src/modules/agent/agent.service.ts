import { IAgentRequest } from "./agent.interface";
import { AgentRequestModel } from "./agent.model";

const agentRequest = async (payload: IAgentRequest) => {
  const isExist = await AgentRequestModel.exists({ email: payload.email });

  if (isExist) {
    return { isExist: true, data: null };
  }

  const { _id, ...data } = (await AgentRequestModel.create(payload)).toObject();
  return { isExist: false, data };
};

const getAllAgentRequests = async () => {
  const data = await AgentRequestModel.find();
  return data;
};

export const AgentService = { agentRequest, getAllAgentRequests };
