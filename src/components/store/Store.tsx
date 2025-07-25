import Navbar from "../Navbar";import StoreList from "./StoreList";

export default function Store() {
  return (
    <section className="flex flex-col items-center  w-full">
      <Navbar />
      <StoreList />
    </section>
  );
}
