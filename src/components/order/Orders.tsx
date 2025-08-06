import { useEffect, useState } from "react";
import Navbar from "../Navbar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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

import {
  ChevronDownIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "react-toastify";

import {
  deleteOrderApi,
  getOrdersByFromToDateApi,
  getOrdersByStoreIdApi,
} from "@/api/order";
import { useNavigate } from "react-router";

import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { getAllItemsApi } from "@/api/item";
import type { ItemInputs } from "../item/ItemList";

type OrderResponse = {
  id: string;
  orderId: string;
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
  itemId: string;
  name: string;
  imageUrl: string | null;
  category: string;
  unit: string;
  price: number;
  GST: number;
};

type Store = {
  id: string;
  storeName: string;
};

export default function Orders() {
  const [isAdmin, setIsAdmin] = useState(false);

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [openToDate, setOpenToDate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [datesInitialized, setDatesInitialized] = useState(false);
  const [itemMaster, setItemMaster] = useState<ItemInputs[]>([]);
  const navigate = useNavigate();

  const filterOrders = async () => {
    if (fromDate && toDate) {
      setIsLoading(true);
      const response = await getOrdersByFromToDateApi(fromDate, toDate);
      if (response?.status === 200) {
        setOrders(response.data.data);
      } else {
        toast.error("Something went wrong");
      }
    }
    setIsLoading(false);
  };

  const exportOrderSummaryToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Order Summary");

    // Step 1: Get all unique items and stores
    const itemSet = new Set<string>();
    const storeSet = new Set<string>();

    orders.forEach((order) => {
      storeSet.add(order.store.storeName);
      order.Items.forEach((item) => itemSet.add(item.Items.name));
    });

    const uniqueItems = Array.from(itemSet);
    const uniqueStores = Array.from(storeSet);

    // Step 2: Write header
    worksheet.getCell("A1").value = "SKU ID";
    worksheet.getCell("B1").value = "Item Name";

    uniqueStores.forEach((store, idx) => {
      worksheet.getCell(1, idx + 3).value = store; // Start from C
    });

    worksheet.getCell(1, uniqueStores.length + 3).value = "Total"; // Last column header

    // Step 3: Fill rows
    uniqueItems.forEach((itemName, rowIdx) => {
      const row = worksheet.getRow(rowIdx + 2);

      const matchedItem = itemMaster.find((item) => item.name === itemName);
      const skuId = matchedItem?.itemId ?? "UNKNOWN";

      row.getCell(1).value = skuId;
      row.getCell(2).value = itemName;

      let itemTotal = 0;

      uniqueStores.forEach((storeName, colIdx) => {
        const quantity = orders
          .filter((order) => order.store.storeName === storeName)
          .flatMap((order) => order.Items)
          .filter((i) => i.Items.name === itemName)
          .reduce((sum, i) => sum + i.quantity, 0);

        row.getCell(colIdx + 3).value = quantity; // Start from column C
        itemTotal += quantity;
      });

      // Final column for item total
      row.getCell(uniqueStores.length + 3).value = itemTotal;
    });

    worksheet.getRow(1).font = { bold: true };

    // Step 4: Save as Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "OrderSummary.xlsx");
  };

  const editOrderHandler = () => {
    if (selectedOrder?.createdAt) {
      const createdAt = new Date(selectedOrder.createdAt);

      const createdDate = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate(),
      );

      const nextDay = new Date(createdDate);
      nextDay.setDate(nextDay.getDate() + 1);

      nextDay.setHours(9, 0, 0, 0);

      const now = new Date();

      if (now < nextDay) {
        navigate(`/order-form/${selectedOrder.id}`);
      } else {
        toast.warn("Editing disabled after 9 AM the next day");
      }
    }
  };

  const deleteOrderHandler = () => {
    if (selectedOrder?.createdAt) {
      const createdAt = new Date(selectedOrder.createdAt);

      const createdDate = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate(),
      );

      const nextDay = new Date(createdDate);
      nextDay.setDate(nextDay.getDate() + 1);

      nextDay.setHours(9, 0, 0, 0);

      const now = new Date();

      if (now < nextDay) {
        onDeleteHandler();
      } else {
        toast.warn("Editing disabled after 9 AM the next day");
      }
    }
  };

  const onDeleteHandler = async () => {
    if (selectedOrder) {
      const response = await deleteOrderApi(selectedOrder.id);
      if (response?.status === 200) {
        toast.success("Order deleted successfully");
        if (isAdmin) {
          getTodaysOrders();
        } else {
          getOrdersForStore(selectedOrder.store.id);
        }
        setIsOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  async function getOrdersForStore(storeId: string) {
    const response = await getOrdersByStoreIdApi(storeId);
    if (response?.status === 200) {
      setOrders(response.data.data);
      console.log(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      setItemMaster(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  function getTodaysOrders() {
    const yesterday6PM = new Date();
    yesterday6PM.setDate(yesterday6PM.getDate() - 1);
    yesterday6PM.setHours(18, 0, 0, 0);
    setFromDate(yesterday6PM);
    setToDate(new Date());
  }

  useEffect(() => {
    if (datesInitialized && fromDate && toDate) {
      filterOrders();
    }
  }, [datesInitialized, fromDate, toDate]);

  useEffect(() => {
    getAllItems();
    const isadmin = localStorage.getItem("isAdmin");
    if (isadmin === "true") {
      setIsAdmin(true);
      getTodaysOrders();
    } else {
      const store = localStorage.getItem("store");
      if (store) {
        getOrdersForStore(JSON.parse(store).id);
        setIsAdmin(false);
      }
    }
    setDatesInitialized(true);
  }, []);

  return (
    <main className="flex w-full flex-col gap-5">
      <Navbar />
      <div className="flex w-full flex-col gap-3 rounded-2xl p-2 px-20">
        {isAdmin ? (
          <div className="flex w-full items-center justify-between">
            <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-[29%] justify-between font-normal"
                >
                  {fromDate
                    ? fromDate.toLocaleString() // shows date + time
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
                  selected={fromDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    if (date) {
                      const updatedDate = new Date(fromDate || new Date());
                      updatedDate.setFullYear(date.getFullYear());
                      updatedDate.setMonth(date.getMonth());
                      updatedDate.setDate(date.getDate());
                      setFromDate(updatedDate);
                    }
                  }}
                />

                {/* Time Picker */}
                <div className="flex items-center gap-2">
                  <label className="text-sm">Time:</label>
                  <input
                    type="time"
                    value={fromDate ? fromDate.toTimeString().slice(0, 5) : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value
                        .split(":")
                        .map(Number);
                      const updatedDate = new Date(fromDate || new Date());
                      updatedDate.setHours(hours);
                      updatedDate.setMinutes(minutes);
                      setFromDate(updatedDate);
                    }}
                    className="rounded border px-2 py-1 text-sm"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={openToDate} onOpenChange={setOpenToDate}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-[30%] justify-between font-normal"
                >
                  {toDate ? toDate.toLocaleString() : "To Date & Time"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-auto space-y-2 overflow-hidden p-4"
                align="start"
              >
                {/* Date Picker */}
                <Calendar
                  mode="single"
                  selected={toDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    if (date) {
                      const updatedDate = new Date(toDate || new Date());
                      updatedDate.setFullYear(date.getFullYear());
                      updatedDate.setMonth(date.getMonth());
                      updatedDate.setDate(date.getDate());
                      setToDate(updatedDate);
                    }
                  }}
                />

                {/* Time Picker */}
                <div className="flex items-center gap-2">
                  <label className="text-sm">Time:</label>
                  <input
                    type="time"
                    value={toDate ? toDate.toTimeString().slice(0, 5) : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value
                        .split(":")
                        .map(Number);
                      const updatedDate = new Date(toDate || new Date());
                      updatedDate.setHours(hours);
                      updatedDate.setMinutes(minutes);
                      setToDate(updatedDate);
                    }}
                    className="rounded border px-2 py-1 text-sm"
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Button
              className="border-primary w-[20%] cursor-pointer"
              variant={"outline"}
              onClick={filterOrders}
            >
              {isLoading ? (
                <LoaderCircle size={24} className="animate-spin" />
              ) : (
                "Filter"
              )}
            </Button>
            <Button
              className="w-[20%] cursor-pointer text-white"
              onClick={exportOrderSummaryToExcel}
            >
              Export
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <Button
              className="cursor-pointer text-white"
              onClick={() => navigate("/order-form")}
            >
              Create new
              <Plus size={20} />
            </Button>
          </div>
        )}

        <table className="h-full w-full">
          <thead>
            <tr className="border text-[#797979]">
              <th className="py-2 font-medium">Order ID</th>
              {isAdmin && <th className="font-medium">Store</th>}
              <th className="py-2 font-medium">Date</th>
              <th className="font-medium">Time</th>
              <th className="font-medium">Total item Count</th>
              <th className="font-medium">Total item Value</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50"
                onClick={() => [setSelectedOrder(order), setIsOpen(true)]}
              >
                <td className="border px-2 py-2 text-center font-medium">
                  {order.orderId}
                </td>
                {isAdmin && (
                  <td className="border px-2 text-center font-medium">
                    {order.store.storeName}
                  </td>
                )}
                <td className="border px-2 py-2 text-center font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="border px-2 py-2 text-center font-medium">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </td>
                <td className="border px-2 text-center font-medium">
                  {order.Items?.filter((item) => item.quantity > 0).length}
                </td>
                <td className="border px-2 text-center font-medium">
                  {order.Items?.reduce((acc, item) => {
                    const gst = (item.Items.price * item.Items.GST) / 100;
                    const total = item.quantity * (item.Items.price + gst);
                    return acc + total;
                  }, 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl">
          <DialogHeader className="flex">
            <div className="flex items-start justify-between pr-10">
              <DialogTitle className="text-primary">
                Order ID: {selectedOrder?.orderId}
              </DialogTitle>
              <div className="flex gap-5">
                <button className="cursor-pointer" onClick={editOrderHandler}>
                  <Pencil size={20} />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger className="cursor-pointer">
                    <Trash size={20} color="red" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Alert!</AlertDialogTitle>
                      <AlertDialogDescription className="font-medium text-black">
                        Are you sure you want to remove this Order? This action
                        is permanent and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                        onClick={deleteOrderHandler}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
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
              </tr>
            </thead>
            <tbody>
              {selectedOrder?.Items?.filter((item) => item.quantity !== 0).map(
                (item, i) => (
                  <tr key={i} className="border">
                    <td className="py-1 text-center">{item.Items?.itemId}</td>
                    <td className="py-1 text-center">{item.Items?.name}</td>
                    <td className="text-center">{item.Items?.unit}</td>
                    <td className="text-center">{item.Items?.GST}</td>
                    <td className="text-center">{item.quantity}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          <div className="flex w-full justify-between font-medium">
            <p>Total(₹)</p>
            <p>
              ₹{" "}
              {selectedOrder?.Items?.reduce((acc, item) => {
                const price = item.Items?.price || 0;
                const gst = item.Items?.GST || 0;
                const quantity = item.quantity || 0;
                const totalWithGst = quantity * (price + (price * gst) / 100);
                return acc + totalWithGst;
              }, 0).toFixed(2)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
