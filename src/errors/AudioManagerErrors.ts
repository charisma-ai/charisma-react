/* eslint-disable max-classes-per-file */
export class AudioManagerInitialisationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioManagerInitialisationError";
  }
}

export class AudioPlaybackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioPlaybackError";
  }
}

export class AudioManagerConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioConnectionError";
  }
}
