import { Types } from "mongoose";

export enum UserRole {
  ADMIN = "Admin",
  USER = "User",
  AGENT = "Agent",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  profilePicture?: string;
  nid: string;
  address?: string;
  dateOfBirth: Date;
  isVerified?: boolean;
}

export interface IUpdateUser {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: UserRole;
  profilePicture?: string;
  nid?: string;
  address?: string;
  dateOfBirth?: Date;
  isVerified?: boolean;
}
