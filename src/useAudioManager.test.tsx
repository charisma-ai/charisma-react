/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { render, act } from "@testing-library/react";
import { AudioManagerProvider, useAudioManager } from "./useAudioManager.js";

// Mock AudioManager class
jest.mock("@charisma-ai/sdk", () => ({
  AudioManager: jest.fn(() => ({
    initialise: jest.fn(),
    startListening: jest.fn(),
    stopListening: jest.fn(),
    connect: jest.fn(),
    resetTimeout: jest.fn(),
    playCharacterSpeech: jest.fn(),
    mediaAudioPlay: jest.fn(),
    mediaAudioSetVolume: jest.fn(),
    mediaAudioToggleMute: jest.fn(),
    mediaAudioStopAll: jest.fn(),
    browserIsSupported: jest.fn(() => true),
  })),
}));

// Helper component to access context in tests
const TestComponent = () => {
  const {
    initialise,
    isListening,
    startListening,
    stopListening,
    connect,
    isBrowserSupported,
  } = useAudioManager();

  return (
    <div>
      <button type="button" onClick={initialise}>
        Initialise
      </button>
      <button type="button" onClick={() => startListening()}>
        Start Listening
      </button>
      <button type="button" onClick={stopListening}>
        Stop Listening
      </button>
      <button
        type="button"
        onClick={() => connect("test-token", "test-session")}
      >
        Connect
      </button>
      <div>Is Listening: {isListening ? "Yes" : "No"}</div>
      <div>Is Browser Supported: {isBrowserSupported ? "Yes" : "No"}</div>
    </div>
  );
};

describe("useAudioManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialise AudioManager and check browser support", () => {
    const { getByText } = render(
      <AudioManagerProvider options={{}}>
        <TestComponent />
      </AudioManagerProvider>,
    );

    expect(getByText("Is Browser Supported: Yes")).toBeInTheDocument();
  });

  it("should start listening and set isListening to true", () => {
    const { getByText } = render(
      <AudioManagerProvider options={{}}>
        <TestComponent />
      </AudioManagerProvider>,
    );

    const startButton = getByText("Start Listening");

    act(() => {
      startButton.click();
    });

    expect(getByText("Is Listening: Yes")).toBeInTheDocument();
  });

  it("should stop listening and set isListening to false", () => {
    const { getByText } = render(
      <AudioManagerProvider options={{}}>
        <TestComponent />
      </AudioManagerProvider>,
    );

    const startButton = getByText("Start Listening");
    const stopButton = getByText("Stop Listening");

    act(() => {
      startButton.click();
    });

    expect(getByText("Is Listening: Yes")).toBeInTheDocument();

    act(() => {
      stopButton.click();
    });

    expect(getByText("Is Listening: No")).toBeInTheDocument();
  });
});
