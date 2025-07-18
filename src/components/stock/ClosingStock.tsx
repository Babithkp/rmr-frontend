import {  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import type { ItemInputs } from "../item/ItemList";
import { LoaderCircle, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "react-toastify";
import { getAllItemsApi } from "@/api/item";
import {
  createClosingStockApi,
  deleteClosingStockApi,
  getAllClosingStockApi,
  getClosingStockApi,
} from "@/api/store";

interface Item {
  name: string;
  itemId: string;
  quantity: number;
}

type SimplifiedOrderResponse = {
  id: string;
  storeId: string;
  createdAt: string; // You can use `Date` if you parse it
  Items: SimplifiedOrderItem[];
};

type SimplifiedOrderItem = {
  Items: {
    name: string;
    unit: string;
  };
  quantity: number;
};

export default function ClosingStock() {
  const [storeId, setStoreId] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState("New");
  const [existingItems, setExistingItems] = useState<ItemInputs[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [closingStock, setClosingStock] = useState<SimplifiedOrderResponse[]>(
    []
  );
  const [newItem, setNewItem] = useState({
    itemId: "",
    name: "",
    quantity: "",
  });

  const deleteClosingStockHandler = async (id: string) => {
    setLoading(true);
    const response = await deleteClosingStockApi(id);
    if (response?.status === 200) {
      toast.success("Closing Stock deleted successfully");
      setClosingStock((prev) => prev.filter((item) => item.id !== id));
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const onSubmit = async () => {
    if (items.length == 0) {
      toast.warn("Please add atleast one item");
      return;
    }
    setLoading(true);
    const response = await createClosingStockApi({
      items: items,
      storeId: storeId,
    });
    if (response?.status === 200) {
      toast.success("Closing Stock created successfully");
      setItems([]);
      setIsCreateModalOpen(false);
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const addItemToListHandler = () => {
    if (newItem.itemId === "" || newItem.quantity === "") {
      toast.warn("Please select an item");
      return;
    }
    if (items?.find((item) => item.itemId === newItem.itemId)) {
      toast.warn("Item already exists");
      return;
    }
    const item = {
      name: newItem.name,
      itemId: newItem.itemId,
      quantity: parseFloat(newItem.quantity as string | "0"),
    };
    setItems((prev) => [...prev, item]);
    setNewItem({ itemId: "", name: "", quantity: "" });
  };

  const removeItemFromListHandler = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      setExistingItems(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getAllClosingStock() {
    const response = await getAllClosingStockApi();
    if (response?.status === 200) {
      setClosingStock(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getClosingStockForStore(storeId: string) {
    const response = await getClosingStockApi(storeId);
    if (response?.status === 200) {
      setClosingStock(response.data.data);
      console.log(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllItems();
    const store = localStorage.getItem("store");
    if (store) {
      setStoreId(JSON.parse(store).id);
      getClosingStockForStore(JSON.parse(store).id);
    } else {
      getAllClosingStock();
    }
  }, []);

  return (
    <section className="w-full p-3 border rounded-2xl flex flex-col gap-5">
      <div className="flex justify-between items-center ">
        <p className="text-lg font-medium">Closing Stock</p>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger
            className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-2 rounded-2xl p-2 px-4 font-medium text-white"
            onClick={() => [setFormStatus("New")]}
          >
            <Plus color="white" size={20} />
            Create new
          </DialogTrigger>
          <DialogContent className="min-w-5xl">
            <DialogHeader>
              <DialogTitle>
                {formStatus == "New" ? "Create Receipt" : "Edit Receipt"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div className="flex flex-col gap-5">
              <div className="w-full flex flex-col gap-2">
                <label>Select Item</label>
                <div className="flex items-center gap-5">
                  <Select
                    value={newItem.name}
                    onValueChange={(value) => {
                      const selectedItem = existingItems.find(
                        (item) => item.name === value
                      );

                      if (selectedItem) {
                        setNewItem((prev) => ({
                          ...prev,
                          itemId: selectedItem.id,
                          name: selectedItem.name,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full ">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {existingItems.map((item) => (
                        <SelectItem value={item.name} key={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex border items-center w-full px-2 rounded-lg">
                    <input
                      type="text"
                      className="w-full   rounded-md p-1 outline-none"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                    />
                    <p className="text-sm">QTY</p>
                  </div>
                  <Button onClick={() => addItemToListHandler()}>Add</Button>
                </div>
                {items.length > 0 && (
                  <div className="w-full flex flex-col gap-2">
                    <label>Item List</label>
                    <table className="w-full">
                      <thead>
                        <tr className="text-[#797979]">
                          <th className="text-start font-medium py-2 border px-2 ">
                            Item Name
                          </th>
                          <th className="text-end font-medium border px-2">
                            Quantity
                          </th>
                          <th className="text-end font-medium border px-2">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items?.map((item) => (
                          <tr key={item.itemId}>
                            <td className="text-start font-medium py-2 border px-2 ">
                              {item.name}
                            </td>
                            <td className="text-end font-medium border px-2">
                              {item.quantity}
                            </td>

                            <td className="place-items-end font-medium border px-2">
                              <Trash
                                color="red"
                                size={20}
                                className="cursor-pointer"
                                onClick={() =>
                                  removeItemFromListHandler(item.itemId)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex w-full justify-end">
                  <Button onClick={onSubmit} disabled={loading}>
                    {loading ? (
                      <LoaderCircle size={24} className="animate-spin" />
                    ) : (
                      "Create Closing Stock"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-[#797979]">
            <th className="text-start font-medium py-2 border px-2 ">Date</th>
            <th className="text-start font-medium border px-2 ">Items</th>
            <th className="text-start font-medium border px-2 ">Action</th>
          </tr>
        </thead>
        <tbody>
          {closingStock?.map((closingStock) => (
            <tr key={closingStock.id}>
              <td className="text-start font-medium py-2 border px-2 ">
                {new Date(closingStock.createdAt).toLocaleDateString()}
              </td>
              <td className="text-start font-medium border px-2">
                {closingStock.Items?.map((item, i) => (
                  <p key={i}>
                    {item.quantity} {item.Items?.name}
                  </p>
                ))}
              </td>
              <td className="text-start font-medium border px-2">
                <Button
                  onClick={() => deleteClosingStockHandler(closingStock.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
