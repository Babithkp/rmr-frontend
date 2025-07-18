import { useEffect, useState } from "react";import {
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

import { LoaderCircle, Pencil, Plus, Trash } from "lucide-react";
import { getAllStoresApi } from "@/api/store";
import { toast } from "react-toastify";
import { getAllItemsApi } from "@/api/item";
import { Button } from "../ui/button";
import type { StoreInputs } from "../store/StoreList";
import type { ItemInputs } from "../item/ItemList";
import {
  receiptApproveApi,
  receiptCreateApi,
  receiptGetAllApi,
  receiptGetByStoreIdApi,
} from "@/api/receipt";

export interface ReceiptItem {
  itemId: string;
  name: string;
  quantity: string;
  price: number;
  GST: string;
}

interface Receipt {
  storeId: string;
  storeName: string;
  items: ReceiptItem[];
  totalAmount: number;
  totalTax: number;
}


export type ReceiptItems = {
  id: string;
  itemId: string;
  quantity: number;
  orderId: string | null;
  closingStockFormId: string | null;
  bOMId: string | null;
  receiptId: string;
  salesDataId: string | null;

  Items: {
    id: string;
    name: string;
    GST: string;
    price: number;
    imageUrl: string | null;
    category: string;
    unit: string;
  };
};

export type Receipts = {
  id: string;
  totalAmount: number;
  totalTax: number;
  status: string;
  createdAt: string; 
  storeId: string;
  items: ReceiptItems[];
  Store: {
    storeName: string;
  };
};

export default function ReceiptPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [formStatus, setFormStatus] = useState("New");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [stores, setStores] = useState<StoreInputs[]>([]);
  const [existingItems, setExistingItems] = useState<ItemInputs[]>([]);
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState<Receipts[]>([]);
  const [newItem, setNewItem] = useState<ReceiptItem>({
    itemId: "",
    name: "",
    quantity: "",
    price: 0,
    GST: "",
  });
  const [receipt, setReceipt] = useState<Receipt>({
    storeId: "",
    storeName: "",
    items: [],
    totalAmount: 0,
    totalTax: 0,
  });

  const onApproveHandler = async (receiptId: string) => {
    setLoading(true);
    const response = await receiptApproveApi(receiptId, storeId);
    if (response?.status === 200) {
      toast.success("Receipt approved successfully");
      if (isAdmin) {
        getAllReceipts();
      } else {
        getReceiptsForStore(storeId);
      }
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const onSubmit = async () => {
    setLoading(true);

    const response = await receiptCreateApi(receipt);
    if (response?.status === 200) {
      toast.success("Receipt created successfully");
      setReceipt({
        storeId: "",
        storeName: "",
        items: [],
        totalAmount: 0,
        totalTax: 0,
      });
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
    if (receipt.items?.find((item) => item.itemId === newItem.itemId)) {
      toast.warn("Item already exists");
      return;
    }
    setReceipt((prev) => {
      const updatedItems = [...prev.items, newItem];
      console.log(receipt);
      

      const newTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

      const newTax = updatedItems.reduce(
        (sum, item) => sum + parseFloat(item.GST || "0"),
        0
      );

      return {
        ...prev,
        items: updatedItems,
        totalAmount: newTotal,
        totalTax: newTax,
      };
    });

    setNewItem({ itemId: "", name: "", quantity: "", price: 0, GST: "" });
  };

  const removeItemFromListHandler = (itemId: string) => {
    setReceipt((prev) => {
      const updatedItems = prev.items.filter((item) => item.itemId !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

      const newTax = updatedItems.reduce(
        (sum, item) => sum + parseFloat(item.GST || "0"),
        0
      );

      return {
        ...prev,
        items: updatedItems,
        total: newTotal,
        tax: newTax,
      };
    });
  };

  async function getAllStores() {
    const response = await getAllStoresApi();
    if (response?.status === 200) {
      setStores(response.data.data);
    } else {
      toast.error("Something went wrong");
      console.log(response);
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

  async function getAllReceipts() {
    const response = await receiptGetAllApi();
    if (response?.status === 200) {
      setReceipts(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getReceiptsForStore(storeId: string) {
    const response = await receiptGetByStoreIdApi(storeId);
    if (response?.status === 200) {
      setReceipts(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllItems();
    getAllStores();
    const admin = localStorage.getItem("isAdmin");
    if (admin === "true") {
      setIsAdmin(true);
      getAllReceipts();
    } else {
      const store = localStorage.getItem("store");
      if (store) {
        getReceiptsForStore(JSON.parse(store).id);
        setStoreId(JSON.parse(store).id);
      }
    }
  }, []);

  return (
    <section className="w-full px-20 ">
      <div className="w-full p-2 px-5 border rounded-2xl">
        <div className="flex justify-between items-center ">
          <p className="text-lg font-medium">Receipts</p>
          {isAdmin && (
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
                  <div className="w-full flex flex-col">
                    <label>Select Store</label>
                    <Select
                      onValueChange={(value) => {
                        const selectedStore = stores.find(
                          (store) => store.id === value
                        );
                        if (selectedStore) {
                          setReceipt((prev) => ({
                            ...prev,
                            storeId: selectedStore.id,
                            storeName: selectedStore.storeName,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Store" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem value={store.id} key={store.id}>
                            {store.storeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                              price: selectedItem.price,
                              GST: selectedItem.GST, 
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
                    {receipt.items.length > 0 && (
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
                                Price
                              </th>
                              <th className="text-end font-medium border px-2">
                                Tax
                              </th>
                              <th className="text-end font-medium border px-2">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {receipt.items?.map((item) => (
                              <tr key={item.itemId}>
                                <td className="text-start font-medium py-2 border px-2 ">
                                  {item.name}
                                </td>
                                <td className="text-end font-medium border px-2">
                                  {item.quantity}
                                </td>
                                <td className="text-end font-medium border px-2">
                                  {item.price}
                                </td>
                                <td className="text-end font-medium border px-2">
                                  {item.GST}
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
                            <tr>
                              <td className=" font-medium border px-2 py-2">
                                Total
                              </td>
                              <td className="border"></td>
                              <td className="border text-end px-2">
                                {receipt.totalAmount}
                              </td>
                              <td className="border text-end px-2">
                                {receipt.totalTax}
                              </td>
                              <td className="border"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="flex w-full justify-end">
                      <Button onClick={onSubmit}>
                        {loading ? (
                          <LoaderCircle size={24} className="animate-spin" />
                        ) : (
                          "Create Receipt"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <table className="h-full w-full mt-5">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2">Receipt Date</th>
              <th className="text-start font-medium">Total Amount</th>
              <th className="text-start font-medium">Total Tax</th>
              {isAdmin && (
                <th className="text-start font-medium">Store Name</th>
              )}
              <th className="text-start font-medium">Items</th>
              <th className="text-end font-medium">Status</th>
              <th className="text-end font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id}>
                <td className="text-start font-medium py-2 border px-2 ">
                  {new Date(receipt.createdAt).toLocaleDateString()}
                </td>
                <td className="text-start font-medium border px-2">
                  {receipt.totalAmount}
                </td>
                <td className="text-start font-medium border px-2">
                  {receipt.totalTax}
                </td>
                {isAdmin && (
                  <td className="text-start font-medium border px-2">
                    {receipt.Store?.storeName}
                  </td>
                )}
                <td className="text-start font-medium border px-2">
                  {receipt.items.map((item, i) => (
                    <p key={i}>
                      {item.quantity} {item.Items?.name}
                    </p>
                  ))}
                </td>
                <td className="text-end font-medium border px-2 capitalize">
                  {receipt.status}
                </td>
                {isAdmin && (
                  <td className=" font-medium border px-2 flex h-full items-center justify-between">
                    <Pencil size={20} className="cursor-pointer" />
                    <Trash
                      color="red"
                      size={20}
                      className="cursor-pointer"
                      // onClick={() => deleteReceiptHandler(receipt.id)}
                    />
                  </td>
                )}
                <td className="flex justify-end h-full items-center border px-2">
                  {receipt.status === "pending" && <Button
                    onClick={() => onApproveHandler(receipt.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <LoaderCircle size={24} className="animate-spin" />
                    ) : (
                      "Approve"
                    )}
                  </Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
