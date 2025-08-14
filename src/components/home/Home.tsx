import Navbar from "@/components/Navbar";
import StockItems from "../stock/StockItems";
export default function Home() {
  return (
    <main className="h-screen w-full flex px-20 flex-col max-xl:px-5 max-sm:px-2 max-sm:text-[10px]">
      <Navbar />
      <StockItems/>
    </main>
  );
}
