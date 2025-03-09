import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout"; // Certifique-se de que o caminho está correto

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Adicione mais rotas conforme necessário */}
        </Route>
      </Routes>
    </Router>
  );
}