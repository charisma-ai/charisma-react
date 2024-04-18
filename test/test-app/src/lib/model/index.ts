import chat, { ChatModel } from "./chat";
import ui, { UIModel } from "./ui";

export interface StoreModel {
  chat: ChatModel;
  ui: UIModel;
}

const model: StoreModel = {
  chat,
  ui,
};

export default model;
