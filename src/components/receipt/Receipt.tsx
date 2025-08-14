import Navbar from "../Navbar";
import ReceiptPage from "./ReceiptPage";

export default function Receipt() {
  return (
    <section className="flex flex-col items-center px-20 w-full max-xl:px-5 max-sm:px-2 max-sm:text-[10px]">
        <Navbar/>
        <ReceiptPage/>
    </section>
  )
}
