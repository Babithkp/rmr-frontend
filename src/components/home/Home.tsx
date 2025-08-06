import Navbar from "@/components/Navbar";
import StockItems from "../stock/StockItems";
export default function Home() {
  return (
    <main className="h-screen w-full flex  flex-col">
      <Navbar />
      <StockItems/>
    </main>
  );
}
