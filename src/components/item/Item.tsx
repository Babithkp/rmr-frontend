import Navbar from "../Navbar";import ItemPage from "./ItemPage";

export default function Item() {
  return (
    <main className="flex flex-col items-center px-20 w-full max-xl:px-5">
      <Navbar />
      <ItemPage />
    </main>
  );
}
