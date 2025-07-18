"use client";
import { useState } from "react";
import ItemList from "./ItemList";
import BomList from "./BomList";


export default function ItemPage() {
  const [sections, setSections] = useState({
    itemList: true,
    bomList: false,
  });

  return (
    <div className="flex flex-col gap-5 items-center w-full">
      <div className="bg-muted  rounded-full flex px-1  py-2 gap-5 font-medium ">
        <button
          onClick={() => setSections({ itemList: true, bomList: false })}
          className={`${
            sections.itemList && "bg-primary text-white"
          } rounded-full px-3 py-2 cursor-pointer`}
        >
          Item List
        </button>
        <button
          onClick={() => setSections({ bomList: true, itemList: false })}
          className={`${
            sections.bomList && "bg-primary text-white"
          }  rounded-full px-3 py-2 cursor-pointer`}
        >
          BOM List
        </button>
      </div>
      {sections.itemList && <ItemList />}
      {sections.bomList && <BomList/>} 
    </div>
  );
}
