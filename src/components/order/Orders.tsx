import { useEffect, useState } from "react";import Navbar from "../Navbar";
import {
  Dialog,
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
import { LoaderCircle, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "react-toastify";
import type { ItemInputs } from "../item/ItemList";
import { getAllItemsApi } from "@/api/item";
import {
  createOrderApi,
  getAllOrdersApi,
  getOrdersByStoreIdApi,
} from "@/api/order";

interface Item {
  name: string;
  itemId: string;
  quantity: number;
}

type OrderResponse = {
  id: string;
  createdAt: string;
  Items: OrderItem[];
  store: Store;
};

type OrderItem = {
  quantity: number;
  Items: ItemDetails;
};

type ItemDetails = {
  id: string;
  name: string;
  imageUrl: string | null;
  category: string;
  unit: string;
};

type Store = {
  id: string;
  storeName: string;
};

export default function Orders() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState("New");
  const [existingItems, setExistingItems] = useState<ItemInputs[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [newItem, setNewItem] = useState({
    itemId: "",
    name: "",
    quantity: "",
  });

  const onSubmit = async () => {
    if (items.length == 0) {
      toast.warn("Please add atleast one item");
      return;
    }
    setLoading(true);
    const response = await createOrderApi({
      items: items,
      storeId: storeId,
    });
    if (response?.status === 200) {
      toast.success("Order created successfully");
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

  async function getAllOrders() {
    const response = await getAllOrdersApi();
    if (response?.status === 200) {
      setOrders(response.data.data);
      console.log(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getOrdersForStore(storeId: string) {
    const response = await getOrdersByStoreIdApi(storeId);
    if (response?.status === 200) {
      setOrders(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllItems();
    const isadmin = localStorage.getItem("isAdmin");
    if (isadmin === "true") {
      setIsAdmin(true);
      getAllOrders();
    } else {
      const store = localStorage.getItem("store");
      if (store) {
        setStoreId(JSON.parse(store).id);
        getOrdersForStore(JSON.parse(store).id);
        setIsAdmin(false);
      }
    }
  }, []);

  return (
    <main className="px-20 flex flex-col gap-5">
      <Navbar />
      <div className="w-full p-2 px-5 border rounded-2xl">
        <div className="flex justify-between items-center ">
          <p className="text-lg font-medium">Order Book</p>
          {!isAdmin && (
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
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
                      <Button onClick={() => addItemToListHandler()}>
                        Add
                      </Button>
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
                          "Create Order"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <table className="h-full w-full ">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2">Order Date</th>
              {isAdmin && (
                <th className="text-start font-medium">Store Name</th>
              )}
              <th className="text-start font-medium">Items</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id}>
                <td className="text-start font-medium py-2 border px-2 ">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="text-start font-medium border px-2">
                    {order.store.storeName}
                  </td>
                )}
                <td className="text-start font-medium border px-2">
                  {order.Items?.map((item, i) => (
                    <p key={i}>
                      {item.quantity} {item.Items?.name}
                    </p>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
