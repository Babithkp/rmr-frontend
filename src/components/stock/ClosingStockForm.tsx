import { useEffect, useState } from "react";
import type { ItemInputs } from "../item/ItemList";
import { LoaderCircle, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "react-toastify";
import { getAllItemsApi } from "@/api/item";
import { createClosingStockApi } from "@/api/store";
import Navbar from "../Navbar";

interface OrderItem {
  itemId: string;
  item: ItemInputs;
  quantity: number;
  full: number;
  loose: number;
}

export default function ClosingStockForm() {
  const [storeId, setStoreId] = useState("");
  const [categories, setCategories] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState("Consumables");
  const [ordeItems, setOrdereItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (ordeItems.length == 0) {
      toast.warn("Please add atleast one item");
      return;
    }
    setLoading(true);
    const response = await createClosingStockApi({
      items: ordeItems,
      storeId: storeId,
    });
    if (response?.status === 200) {
      toast.success("Closing Stock created successfully");
      setOrdereItems(
        ordeItems.map((item) => ({
          ...item,
          quantity: 0,
          price: 0,
          full: 0,
          loose: 0,
        })),
      );
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const addQuantityHandler = (id: string) => {
    const updatedItems = ordeItems.map((orderItem) => {
      if (orderItem.item.id === id) {
        const newQuantity = orderItem.quantity + 1;
        const full = orderItem.full + 1;

        return {
          ...orderItem,
          quantity: newQuantity,
          full: full,
        };
      }
      return orderItem;
    });

    setOrdereItems(updatedItems);
  };

  const removeQuantityHandler = (id: string) => {
    const updatedItems = ordeItems.map((orderItem) => {
      if (orderItem.item.id === id) {
        const newQuantity = Math.max(orderItem.quantity - 1, 0);
        const full = orderItem.full - 1;

        return {
          ...orderItem,
          quantity: newQuantity,
          full: newQuantity === 0 ? 0 : full,
        };
      }
      return orderItem;
    });

    setOrdereItems(updatedItems);
  };

  const handleQuantityChange = (id: string, full: string, loose: string) => {
    const fullValue = full ? parseFloat(full) : 0;
    const looseValue = loose ? parseFloat(loose) / 1000 : 0;

    const total = fullValue + looseValue;

    // Guard against invalid input
    if (isNaN(total) || total < 0) return;

    const updatedItems = ordeItems.map((orderItem) => {
      if (orderItem.item.id === id) {
        const netWieght = orderItem.item.netWeight as number;
        const grosswieght = orderItem.item.grossWeight as number;

        let CTwieght = 0;
        if (looseValue !== 0) {
          CTwieght = netWieght - grosswieght;
        }

        return {
          ...orderItem,
          quantity: fullValue === 0 ? 0 : total - CTwieght,
          full: fullValue,
          loose: looseValue * 1000,
        };
      }
      return orderItem;
    });

    setOrdereItems(updatedItems);
  };

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      const items = response.data.data.map((item: ItemInputs) => ({
        itemId: item.id,
        item: item,
        quantity: 0,
        full: 0,
        loose: 0,
      }));
      setOrdereItems(items);
      const uniqueCategories = Array.from(
        new Set(response.data.data.map((item: ItemInputs) => item.category)),
      );
      setCategories(uniqueCategories as never[]);
      setVisibleCategories(uniqueCategories[0] as never);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllItems();
    const store = localStorage.getItem("store");
    if (store) {
      setStoreId(JSON.parse(store).id);
    }
  }, []);

  return (
    <main className="flex w-full flex-col items-center gap-5 px-20 max-xl:px-5 max-xl:text-[10px]">
      <Navbar />
      <section className="flex w-full gap-5  ">
          <div className="flex w-[30%] flex-col gap-2">
            <div className="flex h-fit flex-col gap-2 rounded-lg border p-2">
              <p className="text-lg font-medium">Categories</p>
              <div className="flex flex-col gap-2">
                {categories.map((category, i) => (
                  <div
                    key={i}
                    className={`hover:bg-primary cursor-pointer rounded-md p-1 hover:text-white ${visibleCategories === category && "bg-primary text-white"}`}
                    onClick={() => setVisibleCategories(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className=" w-[70%] overflow-y-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b text-[#797979]">
                  <th className="py-1">Item</th>
                  <th className="py-1">Unit</th>
                  <th className="py-1">Full</th>
                  <th className="py-1">Loose</th>
                </tr>
              </thead>
              <tbody>
                {ordeItems.map((item, i) => (
                  <tr key={i} className="border-b">
                    {item.item.category === visibleCategories && (
                      <>
                        <td className="place-items-center py-1 text-center">
                          <img
                            src={item.item.imageUrl}
                            alt="Item"
                            className="w-15 object-cover"
                          />
                          <p className="text-xs">{item.item.name}</p>
                        </td>
                        <td className="text-center">{item.item.unit}</td>
                        <td className="text-center text-white">
                          <div className="flex justify-center gap-2">
                            <button
                              className="bg-primary rounded-md p-1"
                              onClick={() =>
                                removeQuantityHandler(item.item.id)
                              }
                            >
                              <Minus className="size-5" />
                            </button>
                            <input
                              className="no-spinner w-10 rounded-md border px-1 text-black"
                              step="any"
                              type="number"
                              value={item.full}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.item.id,
                                  e.target.value,
                                  item.loose.toString(),
                                )
                              }
                            />
                            <button
                              className="bg-primary rounded-md p-1"
                              onClick={() => addQuantityHandler(item.item.id)}
                            >
                              <Plus className="size-5" />
                            </button>
                          </div>
                        </td>
                        <td className="w-30 px-5 text-center">
                          <input
                            className={`w-full rounded border px-2 ${item.item.quantityType === "Full only" ? "hidden" : ""}`}
                            onChange={(e) => {
                              handleQuantityChange(
                                item.item.id,
                                item.full.toString(),
                                e.target.value,
                              );
                            }}
                            value={item.loose}
                          />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        <div className="flex h-[85vh] w-[30%] flex-col justify-between gap-5 overflow-y-auto rounded-lg border p-3 ">
          <div className="flex w-full flex-col gap-2">
            <p className="font-bold">Item Total</p>
            <table>
              <thead>
                <tr className="border text-[#797979]">
                  <th className="py-1 font-medium">Item</th>
                  <th className="font-medium">Unit</th>
                  <th className="font-medium">QTY</th>
                </tr>
              </thead>
              <tbody>
                {ordeItems.map((item) => (
                  <tr key={item.item.id} className="border">
                    {item.quantity !== 0 && (
                      <>
                        <td className="py-1 text-center">{item.item.name}</td>
                        <td className="text-center">{item.item.unit}</td>
                        <td className="text-center">
                          {item.quantity.toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            className="w-full text-white"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <LoaderCircle size={24} className="animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </section>
    </main>
  );
}
