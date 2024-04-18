import { createStore, createTypedHooks } from "easy-peasy";

import model, { StoreModel } from "./model";

const typedHooks = createTypedHooks<StoreModel>();

export const { useStoreActions, useStoreDispatch, useStoreState } = typedHooks;

export const initStore = (initialState?: any) =>
  createStore(model, { initialState, disableImmer: true });
