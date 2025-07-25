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
    setPath(window.location.pathname.split("/")[1]);
  }, []);

  return (
    <header className="w-full flex justify-between px-20 h-20 items-center">
      <div>
        <p className="w-30 font-medium">{storeName}</p>
        <p className="text-3xl font-[600] capitalize">{path}</p>
      </div>
      <div className="text-white flex gap-5 items-center">
        <Button onClick={logoutHandler} className="text-white rounded-2xl px-5 cursor-pointer">
          Logout
        </Button>
        <div className="bg-primary p-2 rounded-full">
          <User />
        </div>
      </div>
    </header>
  );
}
