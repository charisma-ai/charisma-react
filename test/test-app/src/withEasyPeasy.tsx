// import { NextPage } from "next";
import { StoreProvider, Store } from "easy-peasy";
import hoistNonReactStatics from "hoist-non-react-statics";

import { initStore } from "./lib/store";
import { StoreModel } from "./lib/model";

declare global {
  interface Window {
    __NEXT_REDUX_STORE__: Store<StoreModel>;
  }
}

function getOrCreateStore() {
  // Always make a new store if server, otherwise state is shared between requests
  if (typeof window === "undefined") {
    return initStore();
  }

  // Create store if unavailable on the client and set it on the window object
  /* eslint-disable no-underscore-dangle */
  if (!window.__NEXT_REDUX_STORE__) {
    window.__NEXT_REDUX_STORE__ = initStore();
  }
  return window.__NEXT_REDUX_STORE__;
}

const withEasyPeasy = (PageComponent) => {
  const WithEasyPeasy = (pageProps) => {
    const store = getOrCreateStore();
    return (
      <StoreProvider store={store}>
        <PageComponent {...pageProps} />
      </StoreProvider>
    );
  };

  hoistNonReactStatics(WithEasyPeasy, PageComponent);

  return WithEasyPeasy;
};

export default withEasyPeasy;
