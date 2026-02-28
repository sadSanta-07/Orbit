import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Chatroom from "./pages/chatroom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatroom" element={<Chatroom />} />
      </Routes>
    </BrowserRouter>
  );
}