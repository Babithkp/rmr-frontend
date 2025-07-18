import Navbar from "../Navbar";
import ReceiptPage from "./ReceiptPage";

export default function Receipt() {
  return (
    <section className="flex flex-col items-center px-20">
        <Navbar/>
        <ReceiptPage/>
    </section>
  )
}
