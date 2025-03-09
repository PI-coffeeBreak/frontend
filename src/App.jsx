
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import LayoutAuth from "./components/LayoutAuth"
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
          <Route element={<LayoutAuth/>}>
              <Route  path="/signup" element={<Register />}/>
              <Route  path="/login" element={<Login />}/>
          </Route>
      </Routes>
    </Router>
  );
}