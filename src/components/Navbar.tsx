import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import {
  SquareArrowLeft,
  ClipboardMinus,
  BookA,
  LayoutDashboard,
  NotebookText,
  ReceiptText,
  Store,
  Archive,
  Menu,
} from "lucide-react";
import { Drawer } from "antd";

export default function Navbar() {
  const [storeName, setStoreName] = useState("");
  const [path, setPath] = useState("");
  const router = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const logoutHandler = () => {
    localStorage.clear();
    router("/");
  };

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin");
    if (admin === "true") {
      setStoreName("Admin");
      setIsAdmin(true);
    } else {
      const store = localStorage.getItem("store");
      if (store) {
        setStoreName(JSON.parse(store).storeName);
      }
      setIsAdmin(false);
    }
    const path = window.location.pathname.split("/")[2];
    const pathname = window.location.pathname.split("/")[1];
    if (pathname === "order-form") {
      setPath("Order Form");
    } else {
      setPath(path ? path : window.location.pathname.split("/")[1]);
    }
  }, []);

  return (
    <header className="flex h-20 w-full items-center justify-between">
      <div>
        <p className="w-30 font-medium ">{storeName}</p>
        <p className="text-3xl font-[600] capitalize max-sm:text-base">{path}</p>
      </div>
      <div className="flex items-center gap-5 text-white">
        <Button
          onClick={logoutHandler}
          className="cursor-pointer rounded-2xl px-5 text-white"
        >
          Logout
        </Button>
        <button className="bg-primary rounded-full p-2" onClick={showDrawer}>
          <Menu />
        </button>
      </div>
      <Drawer
        title="RMR"
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        open={open}
        size="default"
      >
        <div className="flex flex-col gap-5">
          <a
            href="/home"
            className={`flex cursor-pointer items-center gap-2 bg-black p-1 ${
              location.pathname === "/home" && "bg-[#0000001A]"
            }`}
          >
            <LayoutDashboard size={30} className="text-primary" />
            <p className="text-primary">Dashboard</p>
          </a>
          {isAdmin && (
            <a
              href="/store"
              className={`flex cursor-pointer items-center gap-2 bg-black p-1 ${
                location.pathname === "/store" && "bg-[#0000001A]"
              }`}
            >
              <Store size={30} className="text-primary" />
              <p className="text-primary">Stores</p>
            </a>
          )}
          {isAdmin && (
            <a
              href="/inventory"
              className={`flex cursor-pointer items-center gap-2 bg-black p-1 ${
                location.pathname === "/inventory" && "bg-[#0000001A]"
              }`}
            >
              <Archive size={30} className="text-primary" />
              <p className="text-primary text-center">Item Management</p>
            </a>
          )}
          <a
            href="/order"
            className={`flex cursor-pointer items-center gap-2 bg-[#0000001A] p-1 ${
              location.pathname === "/order" && "bg-[#0000001A]"
            }`}
          >
            <NotebookText size={30} className="text-primary" />
            <p className="text-primary text-center">Order Form</p>
          </a>
          <a
            href="/receipt"
            className={`flex cursor-pointer items-center gap-2 bg-[#0000001A] p-1 ${
              location.pathname === "/receipt" && "bg-[#0000001A]"
            }`}
          >
            <ReceiptText size={30} className="text-primary" />
            <p className="text-primary text-center">Receipts</p>
          </a>
          {isAdmin && (
            <a
              href="/Closing-stock"
              className={`flex cursor-pointer items-center gap-2 bg-[#0000001A] p-1 ${
                location.pathname === "/Closing-stock" && "bg-[#0000001A]"
              }`}
            >
              <BookA size={30} className="text-primary" />
              <p className="text-primary text-center">Cloasing Stock</p>
            </a>
          )}
          {isAdmin && (
            <a
              href="/report"
              className={`flex cursor-pointer items-center gap-2 bg-[#0000001A] p-1 ${
                location.pathname === "/report" && "bg-[#0000001A]"
              }`}
            >
              <ClipboardMinus size={30} className="text-primary" />
              <p className="text-primary text-center">Report</p>
            </a>
          )}
          {!isAdmin && (
            <a
              href="/closing-stock-form"
              className={`flex cursor-pointer items-center gap-2 bg-[#0000001A] p-1 ${
                location.pathname === "/closing-stock-form" && "bg-[#0000001A]"
              }`}
            >
              <BookA size={30} className="text-primary" />
              <p className="text-primary text-center">Closing Stock</p>
            </a>
          )}
          {
            <a
              href="/returns"
              className={`flex cursor-pointer items-center gap-2 bg-[#0000001A] p-1 ${
                location.pathname === "/returns" && "bg-[#0000001A]"
              }`}
            >
              <SquareArrowLeft size={30} className="text-primary" />
              <p className="text-primary text-center">Return</p>
            </a>
          }
        </div>
      </Drawer>
    </header>
  );
}
