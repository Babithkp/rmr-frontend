import Navbar from "../Navbar";import StoreList from "./StoreList";

export default function Store() {
  return (
    <section className="flex flex-col items-center px-20">
      <Navbar />
      <StoreList />
    </section>
  );
}
