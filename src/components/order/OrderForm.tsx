import { useEffect, useRef, useState } from "react";
import type { ItemInputs } from "../item/ItemList";
import Navbar from "../Navbar";
import { getAllItemsApi } from "@/api/item";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { formatter } from "@/lib/utils";
import { createOrderApi } from "@/api/order";

export interface OrderItem {
  item: ItemInputs;
  quantity: number;
  price: number;
}

export default function OrderForm() {
  const [categories, setCategories] = useState([]);
  const [visibleCategories, setVisibleCategories] = useState("Consumables");
  const [ordeItems, setOrdereItems] = useState<OrderItem[]>([]);
  const [storeId, setStoreId] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.current.length) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const onSubmit = async () => {
    const hasValidQuantity = ordeItems.some((item) => item.quantity > 0);
    if (hasValidQuantity) {
      if (!storeId) {
        toast.warn("Please select a store");
        return;
      }
      setLoading(true);
      const response = await createOrderApi({
        items: ordeItems,
        storeId: storeId,
      });
      if (response?.status === 200) {
        toast.success("Order created successfully");
        setOrdereItems(
          ordeItems.map((item) => ({ ...item, quantity: 0, price: 0 })),
        );
      } else if (response?.status === 204) {
        toast.warn("Order already exists for today, please try again tomorrow");
      } else {
        toast.error("Something went wrong");
      }
    } else {
      toast.warn("Please add atleast one item");
      return;
    }
    setLoading(false);
  };

  const handleQuantityChange = (id: string, value: string) => {
    const parsed = value ? parseFloat(value) : 0;
    const updatedItems = ordeItems.map((orderItem) => {
      if (orderItem.item.id === id) {
        const gst = parseFloat(orderItem.item.GST);
        const unitPriceWithGst =
          orderItem.item.price + (orderItem.item.price * gst) / 100;
        const totalPrice = parsed * unitPriceWithGst;

        return {
          ...orderItem,
          quantity: Number(value),
          price: totalPrice,
        };
      }
      return orderItem;
    });

    setOrdereItems(updatedItems);
  };

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      const uniqueCategories = Array.from(
        new Set(response.data.data.map((item: ItemInputs) => item.category)),
      );
      if (uniqueCategories) {
        setCategories(uniqueCategories as never[]);
      }
      setVisibleCategories(uniqueCategories[0] as never);
      const items = response.data.data.map((item: ItemInputs) => ({
        item: item,
        quantity: 0,
        price: 0,
      }));
      setOrdereItems(items);
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
    <main className="flex w-full flex-col gap-5 px-20 max-xl:px-5 max-xl:text-[10px]">
      <Navbar />
      <section className="flex gap-5">
        <div className="flex h-fit w-[30%] flex-col gap-2 rounded-lg border p-2">
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
        <div className="w-[70%] overflow-y-auto rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="text-[#797979]">
                <th className="py-1">Item</th>
                <th>Unit</th>
                <th>GST</th>
                <th>Price</th>
                <th>QTY</th>
              </tr>
            </thead>
            <tbody>
              {ordeItems.map((item, i) => (
                <tr key={item.item.id} className="border border-t">
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
                      <td className="text-center">{item.item.GST}%</td>
                      <td className="text-center">
                        {formatter.format(item.price)}
                      </td>
                      <td className="text-center text-white">
                        <div className="flex justify-center gap-2">
                          <input
                            className="no-spinner w-10 rounded-md border px-1 text-black"
                            value={item.quantity}
                            type="number"
                            step="any"
                            ref={(el) => {
                              inputRefs.current[i] = el
                            }}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            onChange={(e) =>
                              handleQuantityChange(item.item.id, e.target.value)
                            }
                          />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex h-[85vh] w-[30%] flex-col justify-between overflow-y-auto rounded-lg border p-2 text-sm">
          <div className="flex w-full flex-col gap-2">
            <p className="font-bold">Item Total</p>
            <table>
              <thead>
                <tr className="border text-[#797979]">
                  <th className="py-1 font-medium">Item</th>
                  <th className="font-medium">Unit</th>
                  <th className="font-medium">Price(₹)</th>
                  <th className="font-medium">GST</th>
                  <th className="font-medium">QTY</th>
                  <th className="font-medium">Total(₹)</th>
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
                          {formatter.format(item.item.price)}
                        </td>
                        <td className="text-center">{item.item.GST}%</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-center">
                          {formatter.format(item.price)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between font-bold">
              <p>Total(₹)</p>
              <p>
                ₹
                {ordeItems
                  .reduce((acc, item) => acc + item.price, 0)
                  .toFixed(2)}
              </p>
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
        </div>
      </section>
    </main>
  );
}
