export enum AgentRequestStatus {
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
  PENDING = "Pending",
}

export interface IAgentRequest {
  email: string;
  message: string;
  status: AgentRequestStatus;
}
