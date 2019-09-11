import { useRef } from "react";

const noValue = Symbol("lazyRef.noValue");

type NoValue = typeof noValue;

const useLazyRef = <Value>(
  getInitialValue: () => Value,
): React.MutableRefObject<Value> => {
  const lazyRef = useRef<Value | NoValue>(noValue);

  if (lazyRef.current === noValue) {
    lazyRef.current = getInitialValue();
  }

  return lazyRef as React.MutableRefObject<Value>;
};

export default useLazyRef;
