import { useState } from "react";
import Navbar from "../Navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { ChevronDownIcon, Funnel } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export default function Stocks() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [openToDate, setOpenToDate] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="flex w-full flex-col items-center gap-5">
      <Navbar />
      <div className="flex w-full gap-5 rounded-full px-20 py-2 font-medium">
        <p className="font-medium whitespace-nowrap">Closing stock for</p>
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
          </SelectContent>
        </Select>
        <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="justify-between font-normal"
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
              className="justify-between font-normal"
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
          className="border-primary text-primary cursor-pointer"
          variant={"outline"}
          // onClick={filterOrders}
        >
          {/* {isLoading ? (
            <LoaderCircle size={24} className="animate-spin" />
          ) : (
            <>
            </>
          )} */}
          <Funnel size={24} /> Filter
        </Button>
        <Button
          className="cursor-pointer text-white"
          // onClick={exportOrderSummaryToExcel}
        >
          Export
        </Button>
      </div>
      <div className="w-full px-20">
        <div className="rounded-md border">
          <table>
            <thead>
              <tr className="text-[#797979]">
                <th className="p-2 font-medium">Item Name</th>
                <th className="p-2 font-medium">
                  <div className="flex gap-2">
                    <p>Estimated</p>
                    <p>Actual Closing</p>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </main>
  );
}
