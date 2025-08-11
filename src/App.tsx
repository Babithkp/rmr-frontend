import { Routes, Route, useLocation, useNavigate } from "react-router";
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
import ReturnPage from "./components/returns/ReturnPage";
import SaleReport from "./components/report/SaleReport";
import { useEffect } from "react";
import ErrorPage from "./ErrorPage";

function App() {
  const location = useLocation();
  const nagivate = useNavigate();

  useEffect(() => {    
    const isAdmin = localStorage.getItem("isAdmin");
    if (location.pathname !== "/" && !isAdmin) {
      nagivate("/");
    } else if (isAdmin === "true") {
      if (location.pathname === "/closing-stock-form") {
        nagivate("/");
      }
    } else if (isAdmin === "false") {
      if (
        location.pathname === "/store" ||
        location.pathname === "/inventory" ||
        location.pathname === "/Closing-stock" ||
        location.pathname === "/report"
      ) {
        nagivate("/home");
      }
    }
  }, [location.pathname,nagivate]);

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
        <Route path="/returns" element={<ReturnPage />} />
        <Route path="/order-form" element={<OrderForm />} />
        <Route path="/order-form/:orderId" element={<OrderUpdate />} />
        <Route path="/report" element={<Report />} />
        <Route path="/report/sale-report" element={<SaleReport />} />
        <Route path="/closing-stock-form" element={<ClosingStockForm />} />
        <Route path="/closing-stock" element={<Stocks />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
