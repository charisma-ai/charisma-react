import { useEffect, useState } from "react";
import { FaMicrophone as MicrophoneIcon } from "react-icons/fa";

type MicrophoneStatus = "off" | "starting" | "on" | "stopping";

const microphoneColours: Record<MicrophoneStatus, string> = {
  off: "white",
  starting: "grey",
  on: "red",
  stopping: "pink",
};

type ReactiveMicrophoneIconProps = {
  microphoneIsOn: boolean;
  shiftPressed: boolean;
};

const ReactiveMicrophoneIcon = ({
  microphoneIsOn,
  shiftPressed,
}: ReactiveMicrophoneIconProps) => {
  const [microphoneStatus, setMicrophoneStatus] =
    useState<MicrophoneStatus>("off");

  useEffect(() => {
    if (microphoneIsOn) {
      if (shiftPressed) {
        setMicrophoneStatus("on");
      } else {
        setMicrophoneStatus("stopping");
      }
    } else if (shiftPressed) {
      setMicrophoneStatus("starting");
    } else {
      setMicrophoneStatus("off");
    }
  }, [shiftPressed, microphoneIsOn]);

  const microphoneColour = microphoneColours[microphoneStatus];

  return (
    <>
      <div style={{ position: "absolute", right: "10px", top: "25%" }}>
        <MicrophoneIcon
          size={24}
          color={microphoneColour}
          data-testid="microphone-icon"
        />
      </div>
    </>
  );
};

export default ReactiveMicrophoneIcon;
