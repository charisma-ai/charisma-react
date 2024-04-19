type TapButtonProps = {
  onClick: () => void;
};

const TapButton = ({ onClick }: TapButtonProps) => {
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
    </div>
  );
};

export default TapButton;
