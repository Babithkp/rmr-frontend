import Navbar from "../Navbar";import ItemPage from "./ItemPage";

export default function Item() {
  return (
    <main className="flex flex-col items-center w-full">
      <Navbar />
      <ItemPage />
    </main>
  );
}
