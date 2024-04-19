import chat, { ChatModel } from "./chat";

export interface StoreModel {
  chat: ChatModel;
}

const model: StoreModel = {
  chat,
};

export default model;
