import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeScreen from "./screens/HomeScreen";
import TableScreen from "./screens/TableScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PokerScreen from "./screens/PokerScreen";
import TestScreen from "./screens/TestScreen";
import { hostname } from "./constants/userConstants";

// const hostname = window.location.hostname + ":8000";
export const MyContext = createContext({ hostname: hostname });

export default function App() {
  const [dep, setdep] = useState(0);
  const [ai, setai] = useState(0);
  return (
    <Router>
      <Header />
      <main className="">
        <MyContext.Provider value={{ dep: dep, setdep: setdep, ai: ai, setai: setai }}>
          <Routes>
            <Route exact path="/" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/test2" element={<TestScreen />} />
            <Route path="/poker/:id" element={<PokerScreen />} />
            <Route path="/table/:id" element={<TableScreen />} />
          </Routes>
        </MyContext.Provider>
      </main>
      <Footer />
    </Router>
  );
}
