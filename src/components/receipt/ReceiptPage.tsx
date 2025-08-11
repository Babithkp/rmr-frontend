import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { LoaderCircle, Minus, Plus, Trash, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { getAllItemsApi } from "@/api/item";
import { Button } from "../ui/button";
import type { ItemInputs } from "../item/ItemList";
import {
  deleteReceiptApi,
  receiptApproveApi,
  receiptCreateApi,
  receiptGetAllApi,
  receiptGetByStoreIdApi,
  updateReceiptApi,
} from "@/api/receipt";
import * as XLSX from "xlsx";

type TransformedStoreData = {
  storeName: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
};

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
    itemId: string;
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
  const [formStatus, setFormStatus] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [existingItems, setExistingItems] = useState<ItemInputs[]>([]);
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState<Receipts[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipts | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const excelRef = useRef<HTMLInputElement>(null);
  const [tableData, setTableData] = useState<string[][]>([]);

  function transformTableData(
    data: string[][],
    existingItems: ItemInputs[],
  ): TransformedStoreData[] {
    const [headerRow, ...itemRows] = data;
    const storeNames = headerRow.slice(2, -1).map((name) => name.trim());

    const storeMap: Record<string, { itemId: string; quantity: number }[]> = {};
    const storeTotals: Record<
      string,
      { totalAmount: number; totalTax: number }
    > = {};

    // Initialize
    storeNames.forEach((store) => {
      storeMap[store] = [];
      storeTotals[store] = { totalAmount: 0, totalTax: 0 };
    });

    for (const row of itemRows) {
      const skuId = row[0].trim();

      storeNames.forEach((store, idx) => {
        const quantity = Number(row[idx + 2]) || 0;

        const matchedItem = existingItems.find(
          (i) => i.itemId.trim() === skuId,
        );
        const price = matchedItem?.price ?? 0;
        const gstPercent = matchedItem?.GST ? parseFloat(matchedItem.GST) : 0;

        const itemAmount = quantity * price;
        const itemTax = itemAmount * (gstPercent / 100);

        storeMap[store].push({
          itemId: skuId,
          quantity,
        });

        storeTotals[store].totalAmount += itemAmount + itemTax;
        storeTotals[store].totalTax += itemTax;
      });
    }

    // Final result
    const result: TransformedStoreData[] = storeNames.map((storeName) => ({
      storeName,
      items: storeMap[storeName],
      totalAmount: parseFloat(storeTotals[storeName].totalAmount.toFixed(2)),
      totalTax: parseFloat(storeTotals[storeName].totalTax.toFixed(2)),
    }));

    return result;
  }

  function calculateReceiptTotals(items: ReceiptItems[]) {
    let totalAmount = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const price = item.Items.price;
      const gst = parseFloat(item.Items.GST || "0");
      const quantity = item.quantity;

      const tax = (price * gst * quantity) / 100;
      const itemTotal = price * quantity + tax;

      totalTax += tax;
      totalAmount += itemTotal;
    });

    return { totalAmount, totalTax };
  }

  const addQuantityHandler = (id: string) => {
    if (!selectedReceipt) return;

    const updatedItems = selectedReceipt.items.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + 1;
        return {
          ...item,
          quantity: newQuantity,
        };
      }
      return item;
    });

    const { totalAmount, totalTax } = calculateReceiptTotals(updatedItems);

    setSelectedReceipt((prev) =>
      prev
        ? {
            ...prev,
            items: updatedItems,
            totalAmount,
            totalTax,
          }
        : null,
    );
  };

  const removeQuantityHandler = (id: string) => {
    if (!selectedReceipt) return;

    const updatedItems = selectedReceipt.items.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(item.quantity - 1, 0);
        return {
          ...item,
          quantity: newQuantity,
        };
      }
      return item;
    });

    const { totalAmount, totalTax } = calculateReceiptTotals(updatedItems);

    setSelectedReceipt((prev) =>
      prev
        ? {
            ...prev,
            items: updatedItems,
            totalAmount,
            totalTax,
          }
        : null,
    );
  };

  const handleQuantityChange = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0 || !selectedReceipt) return;

    const updatedItems = selectedReceipt.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity: parsed,
        };
      }
      return item;
    });

    const { totalAmount, totalTax } = calculateReceiptTotals(updatedItems);

    setSelectedReceipt((prev) =>
      prev
        ? {
            ...prev,
            items: updatedItems,
            totalAmount,
            totalTax,
          }
        : null,
    );
  };

  const onDeleteHandler = async () => {
    if (selectedReceipt?.id) {
      const response = await deleteReceiptApi(selectedReceipt?.id);
      if (response?.status === 200) {
        toast.success("Receipt deleted successfully");
        setIsOpen(false);
        if (isAdmin) {
          getAllReceipts();
        } else {
          getReceiptsForStore(storeId);
        }
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const onRequestChangeHandler = async () => {
    setLoading(true);
    if (selectedReceipt?.id) {
      const response = await updateReceiptApi({
        id: selectedReceipt.id,
        items: selectedReceipt.items,
        totalAmount: selectedReceipt.totalAmount,
        totalTax: selectedReceipt.totalTax,
      });
      if (response?.status === 200) {
        toast.success("Receipt updated successfully");
        setIsOpen(false);
        setSelectedReceipt(null);
        if (isAdmin) {
          getAllReceipts();
        } else {
          getReceiptsForStore(storeId);
        }
      } else {
        toast.error("Something went wrong");
      }
    }
    setLoading(false);
  };

  const onSubmitTable = async () => {
    const orders = transformTableData(tableData, existingItems);
    setLoading(true);
    Promise.all(
      orders.map(async (order) => {
        const response = await receiptCreateApi(order);
        if (response?.status === 200) {
          toast.success("Receipt created successfully");
          setTableData([]);
          setIsCreateModalOpen(false);
        } else {
          toast.error("Something went wrong");
        }
      }),
    );
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Returns an array of arrays
      });

      setTableData(jsonData as string[][]);
    };

    reader.readAsArrayBuffer(file);
  };

  const onApproveHandler = async () => {
    setLoading(true);
    if (selectedReceipt?.id) {
      const response = await receiptApproveApi(selectedReceipt?.id);
      if (response?.status === 200) {
        toast.success("Receipt approved successfully");
        setIsOpen(false);
        setSelectedReceipt(null);
        if (isAdmin) {
          getAllReceipts();
        } else {
          getReceiptsForStore(storeId);
        }
      } else {
        toast.error("Something went wrong");
      }
    }
    setLoading(false);
  };

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
    <section className="w-full ">
      <div className="w-full p-2">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium">Reciepts</p>
          {isAdmin && (
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger className="border-primary text-primary flex cursor-pointer items-center gap-2 rounded-md border p-2 px-3 text-sm whitespace-nowrap" onClick={()=>setTableData([])}>
                <Plus size={20} />
                Create new
              </DialogTrigger>
              <DialogContent className="min-w-5xl overflow-x-auto max-lg:min-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Receipt</DialogTitle>
                </DialogHeader>
                <DialogDescription></DialogDescription>
                <div className="flex max-h-[80vh] flex-col gap-5 overflow-auto">
                  {tableData.length === 0 && (
                    <div className="flex flex-col gap-3 justify-end">
                      <p>Upload Order Form</p>

                      <div
                        className="grid w-full cursor-pointer place-items-center gap-3 rounded-md border border-dashed p-2 py-10 text-xs text-slate-500"
                        onClick={() => excelRef.current?.click()}
                      >
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload"
                          onChange={handleFileUpload}
                          ref={excelRef}
                        />
                        <Upload size={30} />
                        <p>Upload your order form Excel</p>
                      </div>
                    </div>
                  )}
                  {tableData.length > 0 && (
                    <>
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr>
                            {tableData[0].map((heading, index) => (
                              <th key={index} className="border px-4 py-2">
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="border px-4 py-2 text-center"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex justify-start w-full  ">
                        <Button className="text-white" onClick={onSubmitTable} >
                          {loading ? (
                            <LoaderCircle size={24} className="animate-spin" />
                          ) : (
                            "Generate Receipts"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <table className="mt-5 h-full w-full">
          <thead>
            <tr className="border text-[#797979]">
              {isAdmin && <th className="font-medium">Store</th>}
              <th className="font-medium">Date</th>
              <th className="font-medium">Time</th>
              <th className="font-medium">Total Item count</th>
              <th className="font-medium">Total Item Value</th>
              <th className="font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr
                key={receipt.id}
                className="cursor-pointer border hover:bg-slate-50"
                onClick={() => [setSelectedReceipt(receipt), setIsOpen(true)]}
              >
                {isAdmin && (
                  <td className="px-2 text-center font-medium">
                    {receipt.Store?.storeName}
                  </td>
                )}
                <td className="px-2 py-2 text-center font-medium">
                  {new Date(receipt.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 text-center font-medium">
                  {new Date(receipt.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-2 text-center font-medium">
                  {receipt.items?.filter((item) => item.quantity > 0).length}
                </td>
                <td className="px-2 text-center font-medium">
                  INR {receipt.totalAmount}
                </td>
                <td className="px-2 text-center font-medium capitalize">
                  {receipt.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl max-lg:min-w-2xl">
          <DialogHeader className="flex">
            {isAdmin && selectedReceipt?.status !== "Approved" && (
              <div className="flex items-start justify-between pr-10">
                <DialogTitle className="text-primary"></DialogTitle>
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger className="cursor-pointer">
                      <Trash size={20} color="red" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Alert!</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-black">
                          Are you sure you want to remove this Order? This
                          action is permanent and cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                          onClick={onDeleteHandler}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <table>
            <thead>
              <tr className="border text-[#797979]">
                <th className="py-1 font-medium">SKU ID</th>
                <th className="py-1 font-medium">Item</th>
                <th className="font-medium">Unit</th>
                <th className="font-medium">GST</th>
                <th className="font-medium">QTY</th>
                <th className="font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedReceipt?.items
                ?.filter((item) => item.quantity !== 0)
                .map((item, i) => (
                  <tr key={i} className="border">
                    <td className="py-1 text-center">{item.Items?.itemId}</td>
                    <td className="py-1 text-center">{item.Items?.name}</td>
                    <td className="text-center">{item.Items?.unit}</td>
                    <td className="text-center">{item.Items?.GST}</td>
                    {formStatus === "" && (
                      <td className="text-center">{item.quantity}</td>
                    )}
                    {formStatus === "edit" && (
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="bg-primary rounded-md p-1"
                            onClick={() => removeQuantityHandler(item.id)}
                          >
                            <Minus className="size-5 text-white" />
                          </button>
                          <input
                            className="w-10 rounded-md border px-1 text-black"
                            value={item.quantity}
                            type="text"
                            onChange={(e) =>
                              handleQuantityChange(item.id, e.target.value)
                            }
                            min={0}
                          />
                          <button
                            className="bg-primary rounded-md p-1"
                            onClick={() => addQuantityHandler(item.id)}
                          >
                            <Plus className="size-5 text-white" />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="text-center">
                      {(
                        (item.Items?.price ?? 0) * item.quantity +
                        ((item.Items?.price ?? 0) *
                          item.quantity *
                          parseFloat(item.Items?.GST ?? "0")) /
                          100
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex w-full justify-between text-lg font-medium">
            <p>Total(₹)</p>
            <p>
              ₹{" "}
              {selectedReceipt?.items
                ?.reduce((acc, item) => {
                  const price = item.Items?.price || 0;
                  const gst = item.Items?.GST || 0;
                  const quantity = item.quantity || 0;
                  const totalWithGst =
                    quantity * (price + (price * (gst as number)) / 100);
                  return acc + totalWithGst;
                }, 0)
                .toFixed(2)}
            </p>
          </div>
          {!isAdmin &&
            formStatus === "" &&
            selectedReceipt?.status !== "Requested" &&
            selectedReceipt?.status !== "Approved" && (
              <div className="flex w-full justify-end gap-5">
                <Button
                  variant={"outline"}
                  className="border-primary text-primary"
                  onClick={() => setFormStatus("edit")}
                >
                  Modify
                </Button>
                <Button onClick={onApproveHandler} disabled={loading}>
                  {loading ? (
                    <LoaderCircle size={24} className="animate-spin" />
                  ) : (
                    "Approve"
                  )}
                </Button>
              </div>
            )}

          {!isAdmin && formStatus === "edit" && (
            <div className="flex w-full justify-end gap-5">
              <Button
                variant={"outline"}
                className="border-primary text-primary"
                onClick={() => [setFormStatus(""), setIsOpen(false)]}
              >
                Cancel
              </Button>
              <Button onClick={onRequestChangeHandler} className="text-white">
                Request Change
              </Button>
            </div>
          )}

          {isAdmin && selectedReceipt?.status === "Requested" && (
            <div className="flex w-full justify-end">
              <Button onClick={onApproveHandler} disabled={loading}>
                {loading ? (
                  <LoaderCircle size={24} className="animate-spin" />
                ) : (
                  "Approve"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
