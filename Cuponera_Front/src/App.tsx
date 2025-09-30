// src/App.tsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterCompany from "./pages/RegisterCompany";
import ProfilePage from "@/pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-company" element={<RegisterCompany />} />
      <Route path="*" element={<div style={{padding: 24}}>404</div>} />
    </Routes>
  );
}

export default App;
