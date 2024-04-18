import {
  api,
  CreatePlaythroughTokenOptions,
  setGlobalBaseUrl,
} from "@charisma-ai/react";
import cookie from "cookie";

if (typeof process.env.NEXT_PUBLIC_PLAY_URI === "string") {
  setGlobalBaseUrl(process.env.NEXT_PUBLIC_PLAY_URI);
}

export const createPlaythroughToken = (
  options: CreatePlaythroughTokenOptions,
) => {
  let userToken: string | undefined;
  if (typeof window !== "undefined") {
    userToken = cookie.parse(document.cookie).token;
  }

  return api.createPlaythroughToken({
    ...options,
    userToken,
  });
};

export const createConversation = (token: string) => {
  return api.createConversation(token);
};

export const createCharacterConversation = (
  token: string,
  characterId: number,
) => {
  return api.createCharacterConversation(token, characterId);
};
