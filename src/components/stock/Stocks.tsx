import { useEffect, useState } from "react";
import Navbar from "../Navbar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";
import {
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  getClosingStockByFromToDateApi,
  getClosingStockForPageApi,
} from "@/api/store";
import { toast } from "react-toastify";

interface ClosingStock {
  id: string;
  Items: {
    Items: {
      name: string;
      unit: string;
    };
    quantity: number;
  }[];
  createdAt: string;
  Store: {
    storeName: string;
  };
}

export default function Stocks() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [openToDate, setOpenToDate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cloasingStock, setCloasingStock] = useState<ClosingStock[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ClosingStock | null>(
    null,
  );
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 50;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const onFilterHandler = async () => {
    if (fromDate && toDate) {
      setIsLoading(true);
      const response = await getClosingStockByFromToDateApi(fromDate, toDate);
      if (response?.status === 200) {
        setCloasingStock(response.data.data);
      } else {
        toast.error("Something went wrong");
      }
    }
    setIsLoading(false);
  };

  async function getClosingStock() {
    const response = await getClosingStockForPageApi(currentPage, itemsPerPage);
    if (response?.status === 200) {
      setCloasingStock(response.data.data.items);
      setTotalItems(response.data.data.count);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getClosingStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIndex, endIndex]);

  useEffect(() => {
    getClosingStock();
  }, []);

  return (
    <main className="flex w-full flex-col items-center gap-5 px-20 max-xl:px-5 max-sm:px-2 max-sm:text-[10px]">
      <Navbar />
      <div className="flex w-full justify-between gap-5 rounded-full py-2 font-medium max-sm:flex-col max-sm:gap-5">
        <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-[30%] justify-between font-normal max-sm:w-full"
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
              className="w-[30%] justify-between font-normal max-sm:w-full"
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
          className="w-[20%] cursor-pointer text-white max-sm:w-full"
          onClick={onFilterHandler}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle size={24} className="animate-spin" />
          ) : (
            "Filter"
          )}
        </Button>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <p>
            {startIndex}-{endIndex}
          </p>
          <p>of</p>
          <p>{totalItems}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`cursor-pointer ${currentPage === 1 ? "opacity-50" : ""}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`cursor-pointer ${currentPage === totalPages ? "opacity-50" : ""}`}
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="text-[#797979]">
                <th className="p-2 font-medium">Store</th>
                <th className="p-2 font-medium">Date</th>
                <th className="p-2 font-medium">Time</th>
                <th className="p-2 font-medium">Total Item count</th>
              </tr>
            </thead>
            <tbody>
              {cloasingStock.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer border-t hover:bg-slate-50"
                  onClick={() => [setSelectedReturn(item), setIsOpen(true)]}
                >
                  <td className="p-2 text-center font-medium">
                    {item.Store.storeName}
                  </td>
                  <td className="p-2 text-center font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-center font-medium">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="p-2 text-center font-medium">
                    {item.Items.filter((item) => item.quantity > 0).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl text-sm max-xl:min-w-2xl max-sm:min-w-sm">
          <DialogHeader className="flex">
            <DialogTitle className="text-primary"></DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <table>
            <thead>
              <tr className="border text-[#797979]">
                <th className="py-1 font-medium">Item</th>
                <th className="font-medium">Unit</th>
                <th className="font-medium">QTY</th>
              </tr>
            </thead>
            <tbody>
              {selectedReturn?.Items.map((items, i) => (
                <tr key={i} className="border">
                  <td className="py-1 text-center">{items.Items.name}</td>
                  <td className="py-1 text-center">{items.Items.unit}</td>
                  <td className="py-1 text-center">{items.quantity}</td>
                  <td className="py-1 text-center"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </main>
  );
}
