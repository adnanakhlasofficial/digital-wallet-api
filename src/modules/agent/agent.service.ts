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

const getAllAgentRequests = async (query: any) => {
  const totalRequests = await AgentRequestModel.countDocuments();
  const currentPage = Number(query.currentPage) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (currentPage - 1) * limit || 0;
  const totalPages = Math.ceil(totalRequests / limit);

  const data = await AgentRequestModel.find().skip(skip).limit(limit);
  const meta = { totalRequests, totalPages, currentPage, limit };
  return { data, meta };
};

export const AgentService = { agentRequest, getAllAgentRequests };
