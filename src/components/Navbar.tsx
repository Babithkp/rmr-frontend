import { useEffect, useState } from "react";import { useNavigate } from "react-router";
import { Button } from "./ui/button";
export default function Navbar() {
  const [storeName, setStoreName] = useState("");
  const router = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    router("/");
  };

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin");
    if (admin === "true") {
      setStoreName("Admin");
    } else {
      const store = localStorage.getItem("store");
      if (store) {
        setStoreName(JSON.parse(store).storeName);
      }
    }
  }, []);
  return (
    <header className="w-full flex justify-between px-20 h-20 items-center">
      <p className="w-30 font-medium">{storeName}</p>
      <nav className="flex justify-between w-200 mt-10 h-fit items-center bg-muted p-2 rounded-2xl my-5">
        <p className="text-3xl font-bold">LOGO</p>
        <a href="/home" className="font-medium hover:underline">
          Dashboard
        </a>
        {storeName === "Admin" && (
          <a href="/store" className="font-medium hover:underline">
            Store management
          </a>
        )}
        {storeName === "Admin" && (
          <a href="/inventory" className="font-medium hover:underline">
            Inventory
          </a>
        )}
        {storeName !== "Admin" && (
          <a href="/stock" className="font-medium hover:underline">
            Stocks
          </a>
        )}
        <a href="/order" className="font-medium hover:underline">
          Order Book
        </a>
        <a href="/report" className="font-medium hover:underline">
          Report
        </a>
        <a href="/receipt" className="font-medium hover:underline">
          Receipts
        </a>
        <Button
          className="bg-primary p-2 text-white px-3 rounded-md"
          onClick={logoutHandler}
        >
          Log Out
        </Button>
      </nav>
      <p className="w-30 font-medium"></p>
    </header>
  );
}
