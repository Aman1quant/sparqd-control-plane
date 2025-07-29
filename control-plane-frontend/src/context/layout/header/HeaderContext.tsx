import { createContext, useContext, useReducer, type Dispatch } from "react";
import {
  HeaderReducer,
  initialState,
  type Action,
  type HeaderState,
} from "./HeaderReducer";

interface IHeaderContext extends HeaderState {
  dispatch: Dispatch<Action>;
}

const HeaderContext = createContext<IHeaderContext | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(HeaderReducer, initialState);

  return (
    <HeaderContext.Provider value={{ ...state, dispatch }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context)
    throw new Error(
      "useLearningContext must be used within a LearningProvider"
    );

  return context;
};
