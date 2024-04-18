import { Action, action } from "easy-peasy";

export interface UIModel {
  isSidebarScenesOpen: boolean;
  isSidebarSubplotsOpen: boolean;
  sidebarWidth: number;

  changeSidebarWidth: Action<UIModel, number>;
  toggleSidebarScenesOpen: Action<UIModel, boolean | void>;
  toggleSidebarSubplotsOpen: Action<UIModel, boolean | void>;
}

const ui: UIModel = {
  isSidebarScenesOpen: true,
  isSidebarSubplotsOpen: true,
  sidebarWidth: 250,

  /* eslint-disable no-param-reassign */

  changeSidebarWidth: action((state, payload) => {
    return { ...state, sidebarWidth: payload };
  }),

  toggleSidebarScenesOpen: action((state, payload) => {
    return {
      ...state,
      isSidebarScenesOpen:
        payload !== undefined ? payload : !state.isSidebarScenesOpen,
    };
  }),

  toggleSidebarSubplotsOpen: action((state, payload) => {
    return {
      ...state,
      isSidebarSubplotsOpen:
        payload !== undefined ? payload : !state.isSidebarSubplotsOpen,
    };
  }),
};

export default ui;
