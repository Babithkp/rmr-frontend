import Navbar from "@/components/Navbar";
import StockItems from "../stock/StockItems";
export default function Home() {
  return (
    <main className="h-screen w-full flex px-20 flex-col max-xl:px-5">
      <Navbar />
      <StockItems/>
    </main>
  );
}
