
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import LayoutAuth from "./components/LayoutAuth"
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import InstantiateHome from "./pages/InstantiateHome.jsx"
import LayoutInstantiate from "./components/LayoutInstantiate.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route element={<LayoutAuth/>}>
           <Route  path="/signup" element={<Register />}/>
           <Route  path="/login" element={<Login />}/>
        </Route>
          <Route element={<LayoutInstantiate/>}>
              <Route path="/homeinst" element={<InstantiateHome />}/>
          </Route>
      </Routes>
    </Router>
  );
}