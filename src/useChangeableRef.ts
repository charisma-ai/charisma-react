import { useRef, useEffect } from "react";

const useChangeableRef = <T extends unknown>(value: T) => {
  const valueRef = useRef<T>();
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  return valueRef;
};

export default useChangeableRef;
