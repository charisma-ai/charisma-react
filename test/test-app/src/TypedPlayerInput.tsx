type TypedPlayerInputProps = {
  onSubmitText: (text: string) => void;
};

const TypedPlayerInput = ({ onSubmitText }: TypedPlayerInputProps) => {
  return (
    <>
      <input
        placeholder="Your reply..."
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmitText(event.currentTarget.value.trim());
            // eslint-disable-next-line no-param-reassign
            event.currentTarget.value = "";
          }
        }}
      />
    </>
  );
};

export default TypedPlayerInput;
