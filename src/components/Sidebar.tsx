import LogoWhite from "@/assets/LogoWhite";
import {
  Archive,
  BookA,
  ClipboardMinus,
  LayoutDashboard,
  NotebookText,
  ReceiptText,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export default function Sidebar() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const isadmin = localStorage.getItem("isAdmin");
    if (isadmin === "true") {
      setIsAdmin(true);
    }
  }, []);

  return (
    <nav className="bg-primary flex flex-col items-center gap-20 py-10 text-[10px] text-white">
      <LogoWhite />
      <div className="flex flex-col gap-5">
        <a
          href="/home"
          className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
            location.pathname === "/home" && "bg-[#0000001A]"
          }`}
        >
          <LayoutDashboard size={30} />
          <p>Dashboard</p>
        </a>
        {isAdmin && (
          <a
            href="/store"
            className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
              location.pathname === "/store" && "bg-[#0000001A]"
            }`}
          >
            <Store size={30} />
            <p>Stores</p>
          </a>
        )}
        {isAdmin && (
          <a
            href="/inventory"
            className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
              location.pathname === "/inventory" && "bg-[#0000001A]"
            }`}
          >
            <Archive size={30} />
            <p className="text-center">Item Management</p>
          </a>
        )}
        <a
          href="/order"
          className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
            location.pathname === "/order" && "bg-[#0000001A]"
          }`}
        >
          <NotebookText size={30} />
          <p className="text-center">Order Form</p>
        </a>
        <a
          href="/receipt"
          className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
            location.pathname === "/receipt" && "bg-[#0000001A]"
          }`}
        >
          <ReceiptText size={30} />
          <p className="text-center">Receipts</p>
        </a>
        {isAdmin && (
          <a
            href="/Closing-stock"
            className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
              location.pathname === "/Closing-stock" && "bg-[#0000001A]"
            }`}
          >
            <BookA size={30} />
            <p className="text-center">Cloasing Stock</p>
          </a>
        )}
        {isAdmin && (
          <a
            href="/report"
            className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
              location.pathname === "/report" && "bg-[#0000001A]"
            }`}
          >
            <ClipboardMinus  size={30} />
            <p className="text-center">Report</p>
          </a>
        )}
        {!isAdmin && (
          <a
            href="/closing-stock-form"
            className={`flex cursor-pointer flex-col items-center gap-2 p-1 hover:bg-[#0000001A] ${
              location.pathname === "/closing-stock-form"  && "bg-[#0000001A]"
            }`}
          >
            <BookA size={30} />
            <p className="text-center">Closing Stock</p>
          </a>
        )}
      </div>
    </nav>
  );
}
