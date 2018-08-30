import React from "react";

import CharismaSDK, { CharismaInstance } from "@charisma-ai/sdk";

interface IMessage {
  text: string;
  author: string;
  avatar: string | undefined;
  media: string | undefined;
  metadata: {};
  timestamp: number;
}

interface IPathItem {
  id: number;
  type: "node" | "edge";
}

interface IMessageInfo {
  endStory: boolean;
  path: IPathItem[];
}

interface ICharismaChildProps extends ICharismaState {
  messages: IMessage[];
  start: ({ startNodeId }: { startNodeId: string }) => void;
  reply: ({ text }: { text: string }) => void;
  changeInput: (newInput: string) => void;
  changeIsListening: (newIsListening: boolean) => void;
  changeIsMuted: (newIsMuted: boolean) => void;
}

interface ICharismaProps {
  children: (bag: ICharismaChildProps) => React.ReactNode;
  storyId: string;
  version: number;
  userToken?: string;
  baseURL: string;
  onReply?: (message: IMessage, info: IMessageInfo) => void;
  onSpeakStart?: (message: IMessage, info: IMessageInfo) => void;
  onSpeakStop?: (message: IMessage, info: IMessageInfo) => void;
}

interface ICharismaState {
  disabled: boolean;
  inputValue: string;
  isListening: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isTyping: boolean;
  messages: IMessage[];
  socket: CharismaInstance | null;
}

class Charisma extends React.Component<ICharismaProps, ICharismaState> {
  public static defaultProps = {
    baseURL: "https://api.charisma.ai/play"
  };

  public readonly state: ICharismaState = {
    disabled: false,
    inputValue: "",
    isListening: false,
    isMuted: true,
    isSpeaking: false,
    isTyping: false,
    messages: [],
    socket: null
  };

  public render() {
    return this.props.children({
      changeInput: this.changeInput,
      changeIsListening: this.changeIsListening,
      changeIsMuted: this.changeIsMuted,
      messages: this.state.messages,
      reply: this.reply,
      start: this.start,
      ...this.state
    });
  }

  public componentWillUnmount() {
    if (this.state.isListening) {
      this.changeIsListening(false);
    }
  }

  private getSocket = async () => {
    if (this.state.socket) {
      return this.state.socket;
    }

    const charisma = await CharismaSDK.connect({
      baseUrl: this.props.baseURL,
      storyId: this.props.storyId,
      userToken: this.props.userToken,
      version: this.props.version
    });

    charisma.on("reply", async ({ reply, endStory, ...rest }) => {
      const message = {
        author: reply.character,
        avatar: reply.avatar,
        media: reply.media,
        metadata: reply.metadata,
        text: reply.message,
        timestamp: Date.now()
      };

      this.addMessage(message);

      const messageInfo = { endStory, ...rest };

      if (this.props.onReply) {
        this.props.onReply(reply, messageInfo);
      }

      if (endStory) {
        this.changeIsListening(false);
        this.setState({ disabled: true });
      }

      if (reply.speech) {
        this.setState({ isSpeaking: true });
        if (this.props.onSpeakStart) {
          this.props.onSpeakStart(message, messageInfo);
        }

        await charisma.speak(reply.speech.data);

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

    this.setState({ socket: charisma, disabled: false });
    return charisma;
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
    startNodeId?: string;
    characterId?: string;
  } = {}) => {
    this.clearMessages();
    this.clearInput();

    const socket = await this.getSocket();
    socket.start({
      characterId,
      speech: !this.state.isMuted,
      startNodeId
    });
  };

  private reply = async ({
    text,
    characterId
  }: {
    text: string;
    characterId?: string;
  }) => {
    if (text === "") {
      return;
    }

    this.clearInput();

    this.addMessage({
      author: "Me",
      avatar: undefined,
      media: undefined,
      metadata: {},
      text,
      timestamp: Date.now()
    });

    const socket = await this.getSocket();
    socket.reply({
      characterId,
      message: text,
      speech: !this.state.isMuted
    });
  };
}

export default Charisma;
