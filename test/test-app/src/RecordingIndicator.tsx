type RecordingIndicatorProps = {
  service: string;
};

const RecordingIndicator = ({ service }: RecordingIndicatorProps) => {
  if (!service) {
    return null;
  }
  return (
    <>
      {" "}
      <i>Listening with {service.replace("unified:", "")}</i>
    </>
  );
};

export default RecordingIndicator;
