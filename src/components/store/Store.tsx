import Navbar from "../Navbar";
import StoreList from "./StoreList";

export default function Store() {
  return (
    <section className="flex w-full flex-col items-center px-20 max-xl:px-5 max-sm:px-2 max-sm:text-[10px]">
      <Navbar />
      <StoreList />
    </section>
  );
}
