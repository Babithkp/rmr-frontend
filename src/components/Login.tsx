import { Button } from "@/components/ui/button";
import { LoaderCircle, Lock, User } from "lucide-react";

import { useState } from "react";
import { toast } from "react-toastify";
import { adminLoginApi } from "@/api/admin";
import { useNavigate } from "react-router";
import tikonaLogo from "@/assets/fullLogo-white.png";
import Logo from "@/assets/Logo";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useNavigate();

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userName || !password) {
      toast.warn("Please fill all the fields");
      return;
    }
    setIsLoading(true);

    const response = await adminLoginApi(userName, password);
    if (response?.status === 200) {
      toast.success("Login Successful");
      localStorage.setItem("isAdmin", "true");
      router("/home");
    } else if (response?.status === 202) {
      toast.success("Login Successful");
      localStorage.setItem("isAdmin", "false");
      localStorage.setItem("store", JSON.stringify(response.data.data));
      router("/home");
    } else {
      toast.error("Invalid Credentials or Server Error");
    }

    setIsLoading(false);
  };

  return (
    <main className="bg-primary-foreground flex h-screen w-full flex-col items-center justify-between">
      <section className="grid h-full place-content-center">
        <form
          className="flex w-[25rem] flex-col items-center gap-10 rounded-lg bg-white p-5"
          onSubmit={onFormSubmit}
        >
          <div className="flex items-center gap-2">
            <Logo />
            <p>StockPilot</p>
          </div>
          <h3 className="text-xl font-medium">Welcome Back!</h3>
          <div className="flex w-full flex-col gap-5 text-sm">
            <div className="flex w-full items-center gap-2 rounded-md border border-black p-2 px-3">
              <User size={14} />
              <input
                placeholder="Username"
                className="w-full outline-none placeholder:font-medium"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="flex w-full items-center gap-2 rounded-md border border-black p-2 px-3">
              <Lock size={17} />
              <input
                placeholder="Password"
                className="w-full outline-none placeholder:font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>
          </div>
          <Button
            className="bg-primary w-full cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderCircle size={24} className="animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </section>
      <footer className="bg-primary flex h-[4rem] w-full flex-col items-end justify-center px-10 text-white">
        <div className="flex items-center gap-2 font-medium">
          <p className="text-lg text-black">Made by</p>
          <a href="https://www.trikonatech.com" target="_blank">
            <img src={tikonaLogo} alt="tikona" className="w-30" />
          </a>
        </div>
      </footer>
    </main>
  );
}
