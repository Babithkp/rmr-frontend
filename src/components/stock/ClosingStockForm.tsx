import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import type { ItemInputs } from "../item/ItemList";
import { ChevronDownIcon, LoaderCircle, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "react-toastify";
import { getAllItemsApi } from "@/api/item";
import { createClosingStockApi } from "@/api/store";
import Navbar from "../Navbar";
import { Calendar } from "@/components/ui/calendar";



interface OrderItem {
  itemId: string;
  item: ItemInputs;
  quantity: number;
  full: number;
  loose: number;
}

export default function ClosingStockForm() {
  const [storeId, setStoreId] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [openDate, setOpenDate] = useState(false);
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
        ordeItems.map((item) => ({ ...item, quantity: 0, price: 0, full: 0, loose: 0 })),
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

        const CTwieght = netWieght - grosswieght;

        return {
          ...orderItem,
          quantity: total - CTwieght,
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
    <main className="flex w-full flex-col items-center gap-5">
      <Navbar />
      <section className="flex w-full gap-5 px-20">
        <div className="flex w-[20%] flex-col gap-2">
          <Popover open={openDate} onOpenChange={setOpenDate}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-between font-normal"
              >
                {date
                  ? date.toLocaleString() // shows date + time
                  : "From Date & Time"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-auto space-y-2 overflow-hidden p-4"
              align="start"
            >
              {/* Calendar Picker */}
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (date) {
                    const updatedDate = new Date(date || new Date());
                    updatedDate.setFullYear(date.getFullYear());
                    updatedDate.setMonth(date.getMonth());
                    updatedDate.setDate(date.getDate());
                    setDate(updatedDate);
                  }
                }}
              />

              {/* Time Picker */}
              <div className="flex items-center gap-2">
                <label className="text-sm">Time:</label>
                <input
                  type="time"
                  value={date ? date.toTimeString().slice(0, 5) : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    const updatedDate = new Date(date || new Date());
                    updatedDate.setHours(hours);
                    updatedDate.setMinutes(minutes);
                    setDate(updatedDate);
                  }}
                  className="rounded border px-2 py-1 text-sm"
                />
              </div>
            </PopoverContent>
          </Popover>
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
        <div className="h-[85vh] w-[50%] overflow-y-auto rounded-lg border">
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
                            onClick={() => removeQuantityHandler(item.item.id)}
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
        <div className="flex h-[85vh] w-[30%] flex-col justify-between gap-5 overflow-y-auto rounded-lg border p-3">
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
              "Place Order"
            )}
          </Button>
        </div>
      </section>
    </main>
  );
}
