import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Link } from "react-router";

export default function ErrorPage() {
  return (
    <main className="grid h-screen w-full place-content-center">
      <div className="flex flex-col items-center gap-3 text-center p-5 ">
        <ShieldAlert size={100} className="text-primary" />
        <p className="text-center text-2xl font-bold">
          Oops! Something went wrong
        </p>
        <p className="text-center text-xl">Please try again later</p>
        <Link to="/" className="text-primary text-center flex">
          <ArrowLeft /> Go to Home
        </Link>
      </div>
    </main>
  );
}
