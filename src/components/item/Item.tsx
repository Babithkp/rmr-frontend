import Navbar from "../Navbar";import ItemPage from "./ItemPage";

export default function Item() {
  return (
    <section className="flex flex-col items-center px-20">
      <Navbar />
      <ItemPage />
    </section>
  );
}
