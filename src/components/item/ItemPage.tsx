import { useState } from "react";
import ItemList from "./ItemList";
import BomList from "./BomList";

export default function ItemPage() {
  const [sections, setSections] = useState({
    itemList: true,
    bomList: false,
  });

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      {sections.itemList && <ItemList setSections={setSections} />}
      {sections.bomList && <BomList setSections={setSections}/>}
    </div>
  );
}
