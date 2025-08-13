import Navbar from "../Navbar";
import StoreList from "./StoreList";

export default function Store() {
  return (
    <section className="flex w-full flex-col items-center px-20 max-xl:px-5">
      <Navbar />
      <StoreList />
    </section>
  );
}
