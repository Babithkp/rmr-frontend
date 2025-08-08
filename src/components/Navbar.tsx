import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { User } from "lucide-react";
export default function Navbar() {
  const [storeName, setStoreName] = useState("");
  const [path, setPath] = useState("");
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
    const path = window.location.pathname.split("/")[2];
    const pathname = window.location.pathname.split("/")[1]
    if(pathname === "order-form"){
      setPath("Order Form")
    }else{
      setPath(path ? path : window.location.pathname.split("/")[1]);
    }
  }, []);

  return (
    <header className="flex h-20 w-full items-center justify-between ">
      <div>
        <p className="w-30 font-medium">{storeName}</p>
        <p className="text-3xl font-[600] capitalize">{path}</p>
      </div>
      <div className="flex items-center gap-5 text-white">
        <Button
          onClick={logoutHandler}
          className="cursor-pointer rounded-2xl px-5 text-white"
        >
          Logout
        </Button>
        <div className="bg-primary rounded-full p-2">
          <User />
        </div>
      </div>
    </header>
  );
}
