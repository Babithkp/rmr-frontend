import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { ItemInputs } from "../item/ItemList";
import { toast } from "react-toastify";
import { getAllItemsApi } from "@/api/item";
import { LoaderCircle, Minus, Plus, Trash } from "lucide-react";
import { createReturnsApi } from "@/api/returns";

interface ReturnItem {
  itemId: string;
  name: string;
  quantity: number;
  reason: string;
  unit: string;
  price: number;
}
export default function ReturnForm() {
  const [storeId, setStoreId] = useState("");
  const [item, setItem] = useState<ItemInputs[]>([]);
  const [returnItem, setReturnItem] = useState<ReturnItem[]>([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (returnItem.length == 0) {
      toast.warn("Please add atleast one item");
      return;
    }
    setLoading(true);
    const response = await createReturnsApi(returnItem, storeId);
    if (response?.status === 200) {
      toast.success("Returns created successfully");
      setReturnItem([]);
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleQuantityChange = (id: string, value: string) => {
    const parsed = parseFloat(value);
    // Guard against invalid input
    if (isNaN(parsed) || parsed < 0) return;
    setReturnItem((prev) =>
      prev.map((item) =>
        item.itemId === id ? { ...item, quantity: parsed } : item,
      ),
    );
  };

  const addQuantityHandler = (id: string) => {
    setReturnItem((prev) =>
      prev.map((item) =>
        item.itemId === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const removeQuantityHandler = (id: string) => {
    if (returnItem.find((item) => item.itemId === id)?.quantity === 1) {
      toast.warn("Item quantity not be less than 1");
      return;
    }
    setReturnItem((prev) =>
      prev.map((item) =>
        item.itemId === id ? { ...item, quantity: item.quantity - 1 } : item,
      ),
    );
  };

  const removeReturnItemHandler = (itemId: string) => {
    setReturnItem((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const addReturnItemHandler = () => {
    const idItemExist = returnItem.find(
      (item) => item.name === selectedItemName,
    );
    if (idItemExist) {
      toast.warn("Item already exists");
      return;
    }
    const newItem = item.find((i) => i.name === selectedItemName);
    if (newItem) {
      const newReturnItem = {
        itemId: newItem.id,
        name: newItem.name,
        quantity: 1,
        reason: "",
        unit: newItem.unit,
        price: newItem.price,
      };
      setReturnItem((prev) => [...prev, newReturnItem]);
      setSelectedItemName("");
    }
  };

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      setItem(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllItems();
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      const store = localStorage.getItem("store");
      if (store) {
        setStoreId(JSON.parse(store).id);
      }
    }
  }, []);
  return (
    <>
      <section className="flex w-full items-center justify-between gap-5">
        <Select
          onValueChange={(value) => setSelectedItemName(value)}
          value={selectedItemName}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Item" />
          </SelectTrigger>
          <SelectContent>
            {item.map((item) => (
              <SelectItem value={item.name}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="w-[20%]" onClick={addReturnItemHandler}>
          Add
        </Button>
      </section>
      <section className="flex h-[75vh] flex-col justify-between gap-5">
        <div className="max-h-full overflow-y-auto rounded-lg border">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-2 font-medium text-slate-500">Item</th>
                <th className="font-medium text-slate-500">Unit</th>
                <th className="font-medium text-slate-500">QTY</th>
                <th className="font-medium text-slate-500">Total(₹)</th>
                <th className="font-medium text-slate-500">Reason</th>
                <th className="font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {returnItem.map((item) => (
                <tr key={item.itemId} className="border-t">
                  <td className="py-2 text-center">{item.name}</td>
                  <td className="text-center">{item.unit}</td>
                  <td className="text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-primary rounded-md p-1"
                        onClick={() => removeQuantityHandler(item.itemId)}
                      >
                        <Minus className="size-5" color="white" />
                      </button>
                      <input
                        className="no-spinner w-10 rounded-md border px-1 text-black"
                        value={item.quantity}
                        type="number"
                        step="any"
                        onChange={(e) =>
                          handleQuantityChange(item.itemId, e.target.value)
                        }
                        min={0}
                      />
                      <button
                        className="bg-primary rounded-md p-1"
                        onClick={() => addQuantityHandler(item.itemId)}
                      >
                        <Plus className="size-5" color="white" />
                      </button>
                    </div>
                  </td>
                  <td className="text-center">{item.price * item.quantity}</td>
                  <td className="w-100">
                    <input
                      className="w-full outline-none"
                      type="text"
                      placeholder="Type here..."
                      value={item.reason}
                      onChange={(e) =>
                        setReturnItem((prev) =>
                          prev.map((i) =>
                            i.itemId === item.itemId
                              ? { ...i, reason: e.target.value }
                              : i,
                          ),
                        )
                      }
                    />
                  </td>
                  <td
                    className="place-items-center"
                    onClick={() => removeReturnItemHandler(item.itemId)}
                  >
                    <Trash size={20} color="red" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={onSubmit}>
          {loading ? (
            <LoaderCircle size={24} className="animate-spin" />
          ) : (
            "Submit"
          )}
        </Button>
      </section>
    </>
  );
}
