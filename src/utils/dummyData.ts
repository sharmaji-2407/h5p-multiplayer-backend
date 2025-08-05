import { v4 as uuidv4 } from "uuid";
import { User } from "../types";

export const dummyUsers: User[] = [
  {
    id: uuidv4(),
    name: "Alice",
    isActive: true,
  },
  {
    id: uuidv4(),
    name: "Bob",
    isActive: true,
  },
  {
    id: uuidv4(),
    name: "Charlie",
    isActive: true,
  },
  {
    id: uuidv4(),
    name: "Diana",
    isActive: true,
  },
];

export const getRandomUser = (): User => {
  const randomIndex = Math.floor(Math.random() * dummyUsers.length);
  return dummyUsers[randomIndex];
};
