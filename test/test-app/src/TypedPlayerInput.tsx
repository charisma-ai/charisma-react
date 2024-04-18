import { useEffect } from "react";

type TypedPlayerInputProps = {
  onSubmitText: (text: string) => void;
  offerMicrophone: boolean;
  switchToSpeaking: () => void;
};

const TypedPlayerInput = ({
  onSubmitText,
  offerMicrophone,
  switchToSpeaking,
}: TypedPlayerInputProps) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (offerMicrophone && event.key === "Control") {
      switchToSpeaking?.();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
      // style={{
      //   position: "relative",
      //   top: 0,
      //   left: 0,
      //   fontSize: "20px",
      //   transition: "all 0.2s ease-in-out",
      // }}
      // className="player-input-area"
      >
        <input
          // id="text-input-box"
          placeholder="Your reply..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmitText(event.currentTarget.value.trim());
              // eslint-disable-next-line no-param-reassign
              event.currentTarget.value = "";
            }
          }}

          // style={{
          //   backdropFilter: "blur(10px)",
          //   height: 50,
          //   fontSize: 20,
          //   position: "relative",
          // }}
        />
      </div>
      {/* <style jsx>{`
        .player-input-area {
          position: relative;
          top: 0;
          left: 0;
          font-size: 20px;
          transition: all 0.2s ease-in-out;
        }
      `}</style> */}
    </>
  );
};

export default TypedPlayerInput;
