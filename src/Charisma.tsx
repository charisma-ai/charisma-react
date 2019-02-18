import React from "react";

import CharismaSDK, {
  CharismaInstance,
  CharismaMessage
} from "@charisma-ai/sdk";
import update from "immutability-helper";

export interface IMessage {
  author: string | null;
  avatar: string | null;
  media: string | null;
  metadata: {
    [key: string]: string;
  } | null;
  text: string | null;
  timestamp: number;
  type: "character" | "media" | "player";
}

export interface IPathItem {
  id: number;
  type: "node" | "edge";
}

export interface ICharacterMood {
  happiness: number;
  anger: number;
  trust: number;
  patience: number;
  fearlessness: number;
}

export interface IMessageInfo {
  characterMoods: {
    [id: number]: ICharacterMood;
  };
  endStory: boolean;
  tapToContinue: boolean;
  path: IPathItem[];
  type: "character" | "media";
}

export interface ICharismaChildProps extends ICharismaState {
  messages: IMessage[];
  start: (options?: { startNodeId?: number }) => void;
  reply: (options: { text: string }) => void;
  setMemory: (options: { memoryId: string; saveValue: string }) => void;
  tap: () => void;
  changeInput: (newInput: string) => void;
  changeIsListening: (newIsListening: boolean) => void;
  changeIsMuted: (newIsMuted: boolean) => void;
}

export interface ICharismaProps {
  children: (bag: ICharismaChildProps) => React.ReactNode;
  storyId: number;
  version?: number;
  userToken?: string;
  baseURL: string;
  onStart?: () => void;
  onMessage?: (message: IMessage, info: IMessageInfo) => void;
  onSpeakStart?: (message: IMessage, info: IMessageInfo) => void;
  onSpeakStop?: (message: IMessage, info: IMessageInfo) => void;
}

export interface ICharismaState {
  characterMoods: { [id: number]: ICharacterMood };
  disabled: boolean;
  inputValue: string;
  isListening: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isTyping: boolean;
  messages: IMessage[];
  mode: "chat" | "tap";
  socket: CharismaInstance | null;
}

class Charisma extends React.Component<ICharismaProps, ICharismaState> {
  public static defaultProps = {
    baseURL: "https://api.charisma.ai"
  };

  public readonly state: ICharismaState = {
    characterMoods: {},
    disabled: false,
    inputValue: "",
    isListening: false,
    isMuted: true,
    isSpeaking: false,
    isTyping: false,
    messages: [],
    mode: "chat",
    socket: null
  };

  private socketPromise: Promise<CharismaInstance> | null = null;

  public render() {
    return this.props.children({
      changeInput: this.changeInput,
      changeIsListening: this.changeIsListening,
      changeIsMuted: this.changeIsMuted,
      messages: this.state.messages,
      reply: this.reply,
      setMemory: this.setMemory,
      start: this.start,
      tap: this.tap,
      ...this.state
    });
  }

  public componentWillUnmount() {
    if (this.state.isListening) {
      this.changeIsListening(false);
    }
  }

  private updateCharacterMoods = (
    newCharacterMoods: Array<{ id: number; mood: ICharacterMood }>
  ) => {
    const patch: { [id: number]: { $set: ICharacterMood } } = {};
    newCharacterMoods.forEach(({ id, mood }) => {
      patch[id] = {
        $set: mood
      };
    });
    const updatedCharacterMoods = update(this.state.characterMoods, patch);
    this.setState(() => ({
      characterMoods: updatedCharacterMoods
    }));
    return updatedCharacterMoods;
  };

  private initSocket = async () => {
    const charisma = await CharismaSDK.connect({
      baseUrl: this.props.baseURL,
      storyId: this.props.storyId,
      userToken: this.props.userToken,
      version: this.props.version
    });

    charisma.on("message", async (data: CharismaMessage) => {
      const message = {
        author:
          data.type === "character" && data.message.character !== null
            ? data.message.character.name
            : null,
        avatar:
          data.type === "character" && data.message.character !== null
            ? data.message.character.avatar
            : null,
        media: data.type === "media" ? data.message.url : null,
        metadata: data.type === "character" ? data.message.metadata : null,
        text: data.type === "character" ? data.message.text : null,
        timestamp: Date.now(),
        type: data.type
      };

      this.addMessage(message);
      const updatedCharacterMoods = this.updateCharacterMoods(
        data.characterMoods
      );

      const messageInfo = {
        characterMoods: updatedCharacterMoods,
        endStory: data.endStory,
        path: data.path,
        tapToContinue: data.tapToContinue,
        type: data.type
      };

      const { onMessage } = this.props;
      if (onMessage) {
        onMessage(message, messageInfo);
      }

      if (data.endStory) {
        this.changeIsListening(false);
        this.setState({ disabled: true });
      }

      const { mode } = this.state;
      if (data.tapToContinue && mode === "chat") {
        this.setState({ mode: "tap" });
      } else if (!data.tapToContinue && mode === "tap") {
        this.setState({ mode: "chat" });
      }

      if (data.type === "character" && data.message.speech) {
        this.setState({ isSpeaking: true });
        if (this.props.onSpeakStart) {
          this.props.onSpeakStart(message, messageInfo);
        }

        const audio = ((data.message.speech.audio as unknown) as {
          data: number[];
        }).data;
        await charisma.speak(audio);

        this.setState({ isSpeaking: false });
        if (this.props.onSpeakStop) {
          this.props.onSpeakStop(message, messageInfo);
        }
      }
    });

    charisma.on("start-typing", () => {
      this.setState({ isTyping: true });
    });

    charisma.on("stop-typing", () => {
      this.setState({ isTyping: false });
    });

    charisma.on("recognise-interim", (text: string) => {
      this.changeInput(text);
    });

    charisma.on("recognise", (text: string) => {
      this.reply({ text });
    });

    this.setState({ socket: charisma });
    return charisma;
  };

  private getSocket = async () => {
    if (this.state.socket) {
      return this.state.socket;
    }

    /* De-duplicate multiple requests for the socket */
    if (this.socketPromise) {
      return this.socketPromise;
    }
    this.socketPromise = this.initSocket();
    return this.socketPromise;
  };

  private addMessage = (message: IMessage) =>
    this.setState(({ messages }) => ({ messages: [...messages, message] }));

  private clearInput = () => this.setState({ inputValue: "" });

  private clearMessages = () => this.setState({ messages: [] });

  private changeInput = (newInput: string) =>
    this.setState({ inputValue: newInput });

  private changeIsMuted = (newIsMuted: boolean) =>
    this.setState({ isMuted: newIsMuted });

  private changeIsListening = (newIsListening: boolean) => {
    if (this.state.socket) {
      if (newIsListening) {
        this.state.socket.startListening();
      } else {
        this.state.socket.stopListening();
      }
    }

    this.setState({ isListening: newIsListening });
  };

  private start = async ({
    startNodeId,
    characterId
  }: {
    startNodeId?: number;
    characterId?: number;
  } = {}) => {
    this.clearMessages();
    this.clearInput();

    if (this.props.onStart) {
      this.props.onStart();
    }

    const socket = await this.getSocket();
    socket.start({
      characterId,
      speech: !this.state.isMuted,
      startNodeId
    });

    this.setState({
      disabled: false
    });
  };

  private reply = async ({
    text,
    characterId
  }: {
    text: string;
    characterId?: number;
  }) => {
    if (text === "") {
      return;
    }

    this.clearInput();

    this.addMessage({
      author: "Me",
      avatar: null,
      media: null,
      metadata: {},
      text,
      timestamp: Date.now(),
      type: "player"
    });

    const socket = await this.getSocket();
    socket.reply({
      characterId,
      message: text,
      speech: !this.state.isMuted
    });
  };

  private tap = async ({ speech = false }: { speech?: boolean } = {}) => {
    const socket = await this.getSocket();
    socket.tap({ speech });
  };

  private setMemory = async ({
    memoryId,
    saveValue
  }: {
    memoryId: string;
    saveValue: string;
  }) => {
    const socket = await this.getSocket();
    socket.setMemory({ memoryId, saveValue });
  };
}

export default Charisma;
