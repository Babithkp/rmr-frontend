import  { useEffect, useState } from "react";import {
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
import { createBomApi, deleteBomApi, getAllBomsApi, getAllItemsApi } from "@/api/item";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import type { ItemInputs } from "./ItemList";

export interface ItemSet {
  itemId: string;
  quantity: string;
  name: string;
  Items?: {
    name: string;
    unit: string;
  };
}

interface BOM {
  id: string;
  name: string;
  Items: ItemSet[];
}

export default function BomList() {
  const [formStatus, setFormStatus] = useState("New");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bomName, setBomName] = useState("");
  const [newItem, setNewItem] = useState<ItemSet>({
    itemId: "",
    name: "",
    quantity: "",
  });
  const [newItemList, setNewItemList] = useState<ItemSet[]>([]);
  const [isBomNameAvailable, setIsBomNameAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingItems, setExistingItems] = useState<ItemInputs[]>([]);
  const [bomList, setBomList] = useState<BOM[]>([]);

  const onSubmit = async () => {
    if (!bomName || newItemList.length < 0) {
      toast.warn("Please fill all the fields");
      return;
    }
    setIsLoading(true);
    const response = await createBomApi({
      name: bomName,
      items: newItemList,
    });
    if (response?.status === 200) {
      toast.success("BOM created successfully");
      setIsCreateModalOpen(false);
      setNewItemList([]);
      setBomName("");
      getAllBoms();
    } else if (response?.status === 204) {
      setIsBomNameAvailable(true);
      setTimeout(() => {
        setIsBomNameAvailable(false);
      }, 3000);
    } else {
      toast.error("Something went wrong");
    }
    setIsLoading(false);
  };

  const addItemToListHandler = () => {
    if (newItem.itemId === "" || newItem.quantity === "") {
      toast.warn("Please select an item");
      return;
    }
    if (newItemList.find((item) => item.itemId === newItem.itemId)) {
      toast.warn("Item already exists");
      return;
    }
    setNewItemList((prev) => [...prev, newItem]);
    setNewItem({ itemId: "", name: "", quantity: "" });
  };

  const removeItemFromListHandler = (itemId: string) => {
    setNewItemList((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  async function deleteBomHandler(id: string) {
    const response = await deleteBomApi(id);
    if (response?.status === 200) {
      toast.success("BOM deleted successfully");
      getAllBoms();
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      setExistingItems(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getAllBoms() {
    const response = await getAllBomsApi();
    if (response?.status === 200) {
      setBomList(response.data.data);
      console.log(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllItems();
    getAllBoms();
  }, []);

  return (
    <section className="w-full px-20 ">
      <div className="border rounded-2xl p-3 flex flex-col gap-5">
        <div className="flex justify-between items-center ">
          <p className="font-medium">BOM List</p>
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
                  {formStatus == "New" ? "Create BOM" : "Edit BOM"}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>
              <div className="flex flex-wrap justify-between gap-5">
                <div className="flex w-full flex-col gap-2 ">
                  <label>BOM Name</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2 pl-2"
                    value={bomName}
                    onChange={(e) => setBomName(e.target.value)}
                  />
                </div>
                <div className="w-full">
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
                  {isBomNameAvailable && (
                    <p className="mt-1 text-sm text-red-500">
                      BOM Name already exists, please try another one
                    </p>
                  )}
                </div>
                {newItemList.length > 0 && (
                  <div className="w-full">
                    <label>BOM Item List</label>
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
                        {newItemList?.map((item) => (
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
                  <Button onClick={onSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <LoaderCircle size={24} className="animate-spin" />
                    ) : (
                      "Create BOM"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2 border px-2 ">
                BOM Name
              </th>
              <th className="text-start font-medium border px-2">Items</th>
              <th className="text-start font-medium border px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {bomList?.map((bom) => (
              <tr key={bom.id}>
                <td className="text-start font-medium py-2 border px-2 content-start">
                  {bom.name}
                </td>
                <td className="text-end font-medium border px-2">
                  {bom.Items?.map((item, i) => (
                    <div key={i} className="text-start py-1">
                      <p>Item name: {item.Items?.name}</p>
                      <p>
                        Quantity: {item.quantity} {item.Items?.unit}
                      </p>
                    </div>
                  ))}
                </td>
                <td className="place-items-center font-medium border px-2">
                    <Trash
                      size={24}
                      color="red"
                      className="cursor-pointer"
                      onClick={() => deleteBomHandler(bom.id)}
                    />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
