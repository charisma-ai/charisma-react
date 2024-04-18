type TapButtonProps = {
  isVisible: boolean;
  onClick: () => void;
};

const TapButton = ({ isVisible, onClick }: TapButtonProps) => {
  return (
    <div className="controls">
      <div className="button-container">
        <button
          onClick={() => {
            onClick();
          }}
          style={{}}
        >
          Tap to continue
        </button>
      </div>
      {/* <style jsx>{`
        .controls {
          display: flex;
          position: absolute;
          width: 50%;
          margin: 0 auto;
          left: 0;
          right: 0;
          min-width: 260px;
          bottom: 20px;
          font-size: 20px;
          opacity: 0;
          transition: all 0.5s ease-in-out;
          pointer-events: none;
        }

        .controls.visible {
          opacity: 1;
          bottom: 50px;
          pointer-events: all;
        }

        .button-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style> */}
    </div>
  );
};

export default TapButton;
