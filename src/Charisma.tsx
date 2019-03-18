import React from "react";

import CharismaSDK, {
  CharismaInstance,
  CharismaMessage,
  ISynthesisConfig
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

export type MessageInfo = CharismaMessage & {
  allCharacterMoods: { [id: number]: ICharacterMood };
};

export interface ICharismaProps {
  children: (bag: ICharismaChildProps) => React.ReactNode;
  storyId: number;
  version?: number;
  playthroughToken:
    | string
    | null
    | (() => string | null)
    | (() => Promise<string | null>);
  userToken:
    | string
    | null
    | (() => string | null)
    | (() => Promise<string | null>);
  speechConfig?: boolean | ISynthesisConfig;
  baseURL: string;
  onStart?: () => void;
  onMessage?: (message: IMessage, messageInfo: MessageInfo) => void;
  onSpeak?: (audio: string | number[]) => void;
  onSpeakStart?: (message: IMessage, messageInfo: MessageInfo) => void;
  onSpeakStop?: (message: IMessage, messageInfo: MessageInfo) => void;
}

type CharismaMode = "chat" | "tap";

export interface ICharismaState {
  characterMoods: { [id: number]: ICharacterMood };
  disabled: boolean;
  inputValue: string;
  isListening: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isTyping: boolean;
  messages: IMessage[];
  mode: CharismaMode;
  socket: CharismaInstance | null;
}

class Charisma extends React.Component<ICharismaProps, ICharismaState> {
  public static defaultProps = {
    baseURL: "https://api.charisma.ai",
    playthroughToken: null,
    userToken: null
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

  public componentDidMount() {
    // Initialises the socket and fetches message history on mount.
    this.getSocket();
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
    const { userToken } = this.props;
    const foundUserToken =
      typeof userToken === "function" ? await userToken() : userToken;

    const { playthroughToken } = this.props;
    const foundPlaythroughToken =
      typeof playthroughToken === "function"
        ? await playthroughToken()
        : playthroughToken;

    const { baseURL, storyId, version } = this.props;
    const charisma = await CharismaSDK.connect({
      baseUrl: baseURL,
      playthroughToken: foundPlaythroughToken || undefined,
      storyId,
      userToken: foundUserToken || undefined,
      version
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

      const messageInfo: MessageInfo = {
        ...data,
        allCharacterMoods: updatedCharacterMoods
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

      const { isMuted } = this.state;
      if (!isMuted && data.type === "character" && data.message.speech) {
        this.setState({ isSpeaking: true });
        const { onSpeakStart, onSpeak, onSpeakStop } = this.props;
        if (onSpeakStart) {
          onSpeakStart(message, messageInfo);
        }

        const { audio } = data.message.speech;
        if (onSpeak) {
          await onSpeak(typeof audio === "string" ? audio : audio.data);
        } else if (typeof audio !== "string") {
          await charisma.speak(audio.data);
        }

        this.setState({ isSpeaking: false });
        if (onSpeakStop) {
          onSpeakStop(message, messageInfo);
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

    let fixedMessages: IMessage[] = [];
    let fixedMode: CharismaMode = "chat";
    if (foundUserToken && foundPlaythroughToken) {
      const messages = await charisma.getMessageHistory();
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.type === "character" && lastMessage.tapToContinue) {
          fixedMode = "tap";
        }
      }
      fixedMessages = messages.map(message => {
        const fixedMessage: IMessage = {
          author: null,
          avatar: null,
          media: null,
          metadata: null,
          text: message.text,
          timestamp: message.timestamp,
          type: message.type
        };
        if (message.type === "character") {
          if (message.character) {
            fixedMessage.author = message.character.name;
            fixedMessage.avatar = message.character.avatar;
          }
          if (message.media) {
            fixedMessage.media = message.media;
            fixedMessage.type = "media";
          }
          if (message.metadata) {
            fixedMessage.metadata = message.metadata;
          }
        }

        if (message.type === "player") {
          fixedMessage.author = "Me";
        }

        return fixedMessage;
      });
    }

    this.setState({
      messages: fixedMessages,
      mode: fixedMode,
      socket: charisma
    });
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
      speech: this.state.isMuted ? false : this.props.speechConfig || true,
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
      speech: this.state.isMuted ? false : this.props.speechConfig || true
    });
  };

  private tap = async () => {
    const socket = await this.getSocket();
    socket.tap({
      speech: this.state.isMuted ? false : this.props.speechConfig || true
    });
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
