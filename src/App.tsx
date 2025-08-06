import { Routes, Route, useLocation } from "react-router";
import Home from "./components/home/Home";
import Login from "./components/Login";
import Store from "./components/store/Store";
import Item from "./components/item/Item";
import Receipt from "./components/receipt/Receipt";
import Orders from "./components/order/Orders";
import Report from "./components/report/Report";
import Sidebar from "./components/Sidebar";
import OrderForm from "./components/order/OrderForm";
import OrderUpdate from "./components/order/OrderUpdate";
import ClosingStockForm from "./components/stock/ClosingStockForm";
import Stocks from "./components/stock/Stocks";



function App() {
  const location = useLocation();
  console.log(location.pathname);
  return (
    <>
      {location.pathname !== "/" && <Sidebar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/inventory" element={<Item />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/order" element={<Orders />} />
        <Route path="/order-form" element={<OrderForm />} />
        <Route path="/order-form/:orderId" element={<OrderUpdate />} />
        <Route path="/report" element={<Report />} />
        <Route path="/closing-stock-form" element={<ClosingStockForm />} />
        <Route path="/closing-stock" element={<Stocks />} />

      </Routes>
    </>
  );
}

export default App;
