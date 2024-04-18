import { StoreProvider } from "easy-peasy";
import hoistNonReactStatics from "hoist-non-react-statics";

import { initStore } from "./lib/store";
import { ComponentType } from "react";

const store = initStore();

const withEasyPeasy = (PageComponent: ComponentType<any>) => {
  const WithEasyPeasy = (pageProps: any) => {
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
