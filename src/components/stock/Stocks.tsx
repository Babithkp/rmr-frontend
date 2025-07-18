import { useState } from "react";
import Navbar from "../Navbar";
import StockItems from "./StockItems";
import ClosingStock from "./ClosingStock";
export default function Stocks() {
const [sections, setSections] = useState({
    stockItems: true,
    closingStock: false,
  });


  return (
    <main className="px-20 flex flex-col gap-5 items-center">
      <Navbar />
      <div className="bg-muted  rounded-full flex px-1  py-2 gap-5 font-medium ">
        <button
          onClick={() => setSections({ stockItems: true, closingStock: false })}
          className={`${
            sections.stockItems && "bg-primary text-white"
          } rounded-full px-3 py-2 cursor-pointer`}
        >
          Item List
        </button>
        <button
          onClick={() => setSections({ stockItems: false, closingStock: true })}
          className={`${
            sections.closingStock && "bg-primary text-white"
          }  rounded-full px-3 py-2 cursor-pointer`}
        >
          Closing Stock
        </button>
      </div>
      {sections.stockItems && <StockItems />}
      {sections.closingStock && <ClosingStock />}
    </main>
  );
}
