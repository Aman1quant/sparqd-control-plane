import type { Header } from "./type";

export type HeaderState = {
  header: Header;
};

export const initialState: HeaderState = {
  header: {
    title: "",
    description: "",
    search: false,
  },
};

export type Action = { type: "SET_HEADER"; payload: Header };

export function HeaderReducer(state: HeaderState, action: Action): HeaderState {
  switch (action.type) {
    case "SET_HEADER":
      return {
        ...state,
        header: action.payload,
      };

    default:
      return state;
  }
}
