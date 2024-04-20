import React, { createContext, useContext, useState } from 'react';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [storyJSON, setStoryJSON] = useState({});

  return (
    <GlobalStateContext.Provider value={{ storyJSON, setStoryJSON }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
