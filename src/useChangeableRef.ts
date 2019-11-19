import { useRef, useEffect } from "react";

const useChangeableRef = <T extends unknown>(value: T) => {
  const valueRef = useRef<T>(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
};

export default useChangeableRef;
