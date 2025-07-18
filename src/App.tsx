import { Routes, Route } from "react-router";
import Home from "./components/home/Home";
import Login from "./components/Login";
import Store from "./components/store/Store";
import Item from "./components/item/Item";
import Receipt from "./components/receipt/Receipt";
import Stocks from "./components/stock/Stocks";
import Orders from "./components/order/Orders";
import Report from "./components/report/Report";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/inventory" element={<Item />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/stock" element={<Stocks />} />
        <Route path="/order" element={<Orders />} />
        <Route path="/report" element={<Report />} /> 
      </Routes>
    </>
  );
}

export default App;
