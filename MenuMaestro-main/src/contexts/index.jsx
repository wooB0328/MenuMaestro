import React, { useReducer } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCdGCsFCvfwgJg23ToUNl8KpEiGM41fotY",
  authDomain: "fooddata-4ddda.firebaseapp.com",
  databaseURL: "https://fooddata-4ddda-default-rtdb.firebaseio.com",
  projectId: "fooddata-4ddda",
  storageBucket: "fooddata-4ddda.appspot.com",
  messagingSenderId: "216874707741",
  appId: "1:216874707741:web:ebcb269baea2880e698ff4"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Define the initial state for the database
const initialState = database;

// Define the reducer function
function databaseReducer(state, action) {
  switch (action.type) {
    case 'REGISTER_DATABASE':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'WRITE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item !== action.payload),
      };
    default:
      return state;
  }
}

// Create a context to provide the database and dispatch functions
const DatabaseContext = React.createContext(initialState);

// Custom hook to use the database and dispatch functions
function useDatabase() {
  return React.useContext(DatabaseContext);
}

// Database provider component
function DatabaseProvider({ children }) {
  const [database, dispatch] = useReducer(databaseReducer, initialState);

  return (
    <DatabaseContext.Provider value={{ database, dispatch }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export { useDatabase, DatabaseProvider };