import { ChevronDownIcon, Funnel, LoaderCircle } from "lucide-react";
import Navbar from "../Navbar";
import { useEffect, useState } from "react";
import { getAllStoresApi, getOpeningClosingStockApi } from "@/api/store";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { useNavigate } from "react-router";
import { getSalesDataForStoreApi } from "@/api/sales";
import { getAllItemsApi } from "@/api/item";
import { getOrdersByStoreDateApi } from "@/api/order";
import { getReturnsByFromToDateApi } from "@/api/returns";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

interface OrderItem {
  id: string;
  orderId: string;
  createdAt: string; // or Date
  store: Store;
  Items: {
    itemId: string;
    Items: Item; // full Item object
    quantity: number;
  }[];
}

interface ReturnItem {
  id: string;
  status: string;
  storeId: string;
  createdAt: string; // or Date
  Items: {
    itemId: string;
    quantity: number;
    reason: string;
  }[];
  Store: {
    storeName: string;
  };
}

interface Store {
  id: string;
  storeName: string;
}

type StockItem = {
  quantity: number;
  Items: {
    name: string;
    unit: string;
  };
};

type ClosingStockForm = {
  id: string;
  storeId: string;
  createdAt: Date;
  Items: StockItem[];
};

type ResultType = {
  date: string;
  openingStock: ClosingStockForm | null;
  closingStock: ClosingStockForm | null;
}[];

type Item = {
  id: string;
  itemId: string;
  name: string;
  price: number;
  GST: string;
  netWeight: number;
  grossWeight: number;
  imageUrl: string;
  quantityUnit: number;
  unit: string;
  category: string;
  quantityType: string;
  MOQ: number | null;
};

type ReportItem = {
  item: string;
  opening: number;
  purchase: number;
  return: number;
  closing: number;
  sales: number;
};

type ReportDay = {
  date: string;
  data: ReportItem[];
};

interface SalesRecord {
  id: string;
  store: {
    storeId: string;
    storeName: string;
  };
  Items: {
    Items: {
      itemId: string;
      name: string;
    };
    quantity: number;
  }[];
  createdAt: string; // date string
}

interface EstimateStock {
  item: string;
  estimatedQty: number;
  actualQty: number;
}

const generateReport = (
  items: Item[],
  stockData: ResultType,
  purchaseData: OrderItem[],
  returnData: ReturnItem[],
  salesData: SalesRecord[],
): ReportDay[] => {
  const report: ReportDay[] = [];

  for (const day of stockData) {
    const dayReport: ReportItem[] = [];

    for (const item of items) {
      // Opening stock
      const openingStockQty =
        day.openingStock?.Items.find((i) => i.Items.name === item.name)
          ?.quantity ?? 0;

      // Closing stock
      const closingStockQty =
        day.closingStock?.Items.find((i) => i.Items.name === item.name)
          ?.quantity ?? 0;

      // Purchases for this day
      const purchaseQty = purchaseData.reduce((sum, order) => {
        if (new Date(order.createdAt).toISOString().split("T")[0] !== day.date)
          return sum;
        const match = order.Items.find((p) => p.Items.id === item.id);
        return match ? sum + match.quantity : sum;
      }, 0);

      // Returns for this day
      const returnQty = returnData.reduce((sum, ret) => {
        // Only count returns from the same date
        if (new Date(ret.createdAt).toISOString().split("T")[0] !== day.date)
          return sum;

        const match = ret.Items.find((rItem) => rItem.itemId === item.id);
        return match ? sum + match.quantity : sum;
      }, 0);

      // Sales for this day
      const salesQty = salesData.reduce((sum, sale) => {
        if (new Date(sale.createdAt).toISOString().split("T")[0] !== day.date)
          return sum;
        const match = sale.Items.find(
          (saleItem) => saleItem.Items.itemId === item.itemId,
        );
        return match ? sum + match.quantity : sum;
      }, 0);

      dayReport.push({
        item: item.name,
        opening: openingStockQty,
        purchase: purchaseQty,
        return: returnQty,
        closing: closingStockQty,
        sales: salesQty,
      });
    }

    report.push({
      date: day.date,
      data: dayReport,
    });
  }

  return report;
};
function calculateEstimatedStocks(report: ReportDay[]) {
  // Collect all item names
  const itemNames = Array.from(
    new Set(report.flatMap((day) => day.data.map((d) => d.item))),
  );

  return itemNames.map((itemName) => {
    let estimatedQty = 0;
    let actualQty = 0;

    report.forEach((day) => {
      const found = day.data.find((d) => d.item === itemName);
      if (found) {
        estimatedQty += Math.abs(
          found.opening > found.sales
            ? found.opening - found.sales
            : found.sales - found.opening,
        );
        actualQty += found.closing;
      }
    });

    return {
      item: itemName,
      estimatedQty,
      actualQty,
    };
  });
}

async function exportStockReport(
  storeName: string,
  report: ReportDay[],
  estimateData: EstimateStock[],
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Stock Report");

  let rowIndex = 1;

  // Store name at top
  sheet.mergeCells(rowIndex, 1, rowIndex, report.length * 6);
  sheet.getCell(rowIndex, 1).value = storeName;
  sheet.getCell(rowIndex, 1).font = { bold: true, size: 14 };
  rowIndex += 2;

  // Date row
  const dateRow = sheet.getRow(rowIndex);
  report.forEach((day, idx) => {
    const startCol = idx * 6 + 1;
    sheet.mergeCells(rowIndex, startCol, rowIndex, startCol + 5);
    const cell = dateRow.getCell(startCol);
    cell.value = day.date;
    cell.font = { bold: true, size: 12 };
  });
  rowIndex++;

  // Header row
  const headerRow = sheet.getRow(rowIndex);
  report.forEach((day, idx) => {
    const startCol = idx * 6 + 1;
    if (idx === 0) {
      // First day: full headers
      const headers = [
        "Item Names",
        "Opening",
        "Purchase",
        "Return",
        "Closing",
        "Sales",
      ];
      headers.forEach((h, hIdx) => {
        const cell = headerRow.getCell(startCol + hIdx);
        cell.value = h;
        cell.font = { bold: true };
      });
    } else {
      // Other days: skip "Item Names"
      const headers = ["Opening", "Purchase", "Return", "Closing", "Sales"];
      headers.forEach((h, hIdx) => {
        const cell = headerRow.getCell(startCol + hIdx); // start at second col
        cell.value = h;
        cell.font = { bold: true };
      });
    }
  });

  rowIndex++;

  // Fill data horizontally
  const maxItems = Math.max(...report.map((r) => r.data.length));
  for (let i = 0; i < maxItems; i++) {
    const row = sheet.getRow(rowIndex);

    report.forEach((day, idx) => {
      const startCol = idx * 6 + 1;
      const item = day.data[i];
      if (item) {
        if (idx === 0) {
          // For first day: include item name
          row.getCell(startCol).value = item.item;
          row.getCell(startCol + 1).value = item.opening;
          row.getCell(startCol + 2).value = item.purchase;
          row.getCell(startCol + 3).value = item.return;
          row.getCell(startCol + 4).value = item.closing;
          row.getCell(startCol + 5).value = item.sales;
        } else {
          // For other days: leave item name cell blank, just fill numeric data starting from startCol + 1
          row.getCell(startCol).value = item.opening;
          row.getCell(startCol + 1).value = item.purchase;
          row.getCell(startCol + 2).value = item.return;
          row.getCell(startCol + 3).value = item.closing;
          row.getCell(startCol + 4).value = item.sales;
        }
      }
    });
    rowIndex++;
  }

  // --- Safer placement of Estimated / Actual (match by item name if possible) ---
  const totalCols = report.length * 6;
  const estStartCol = totalCols + 2; // gap

  // Build a lookup map if estimateData includes item names
  const estimateByName = new Map<string, EstimateStock>();
  const estimatesHaveNames = estimateData.some(
    (e) => typeof e.item === "string" && e.item!.trim() !== "",
  );
  if (estimatesHaveNames) {
    estimateData.forEach((e) => {
      if (e.item) estimateByName.set(e.item.trim(), e);
    });
  }

  // The header row index for item headers
  const headerRowIndex = rowIndex - maxItems - 1;
  const estHeaderRow = sheet.getRow(headerRowIndex);
  estHeaderRow.getCell(estStartCol).value = "Estimated";
  estHeaderRow.getCell(estStartCol + 1).value = "Actual Closing";
  estHeaderRow.getCell(estStartCol).font = { bold: true };
  estHeaderRow.getCell(estStartCol + 1).font = { bold: true };

  // Items start row
  const itemsStartRow = rowIndex - maxItems;

  for (let i = 0; i < maxItems; i++) {
    const worksheetRow = sheet.getRow(itemsStartRow + i);

    // Find an item name present in this row across days (take first non-empty)
    let rowItemName: string | undefined;
    for (let d = 0; d < report.length; d++) {
      const day = report[d];
      const itemObj = day.data[i];
      if (itemObj && itemObj.item) {
        rowItemName = itemObj.item.trim();
        break;
      }
    }

    let est: EstimateStock | undefined;

    if (estimatesHaveNames && rowItemName) {
      est = estimateByName.get(rowItemName);
    }

    // Fallback: align by index if no named match
    if (!est) {
      est = estimateData[i];
    }

    if (est) {
      worksheetRow.getCell(estStartCol).value = est.estimatedQty;
      worksheetRow.getCell(estStartCol + 1).value = est.actualQty;
    } else {
      // optional: leave blank or set '-', 0, etc.
      // worksheetRow.getCell(estStartCol).value = "-";
      // worksheetRow.getCell(estStartCol + 1).value = "-";
    }
  }
  // --- end estimates placement ---

  // Auto-fit columns
  sheet.columns?.forEach((col) => {
    if (!col) return;
    let maxLength = 0;
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      let val = cell.value;
      if (typeof val === "object" && val !== null && "text" in val) {
        val = val.text;
      }
      const str = val != null ? val.toString() : "";
      maxLength = Math.max(maxLength, str.length);
    });
    col.width = maxLength + 2;
  });

  // Export file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `${storeName}-StockReport.xlsx`;
  saveAs(new Blob([buffer]), fileName);
}

export default function Report() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [openToDate, setOpenToDate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [store, setStore] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [report, setReport] = useState<ReportDay[]>([]);
  const [estimatedStocks, setEstimatedStocks] = useState<EstimateStock[]>([]);

  const nagivate = useNavigate();

  const exportHandler = async () => {
    if (
      report.length === 0 ||
      selectedStore === "" ||
      estimatedStocks.length === 0
    ) {
      toast.warn("Please fetch data first");
      return;
    }
    const storeName = store.find((s) => s.id === selectedStore)?.storeName;
    exportStockReport(storeName ?? "", report, estimatedStocks);
  };

  const filterHandler = async () => {
    if (selectedStore === "") {
      toast.warn("Please select a store");
      return;
    }
    if (!fromDate || !toDate) {
      toast.warn("Please select a date range");
      return;
    }
    setIsLoading(true);
    const returnData = await getReturnsByStoreDate(
      selectedStore,
      fromDate,
      toDate,
    );
    const purchaseData = await getOrdersByStoreDate(
      selectedStore,
      fromDate,
      toDate,
    );
    const salesData = await getSaleDataForStore(
      selectedStore,
      fromDate,
      toDate,
    );
    const stockData = await getOpeningClosingStock(
      selectedStore,
      fromDate,
      toDate,
    );
    const report = generateReport(
      items,
      stockData,
      purchaseData,
      returnData,
      salesData,
    );
    setReport(report);
    const estimatedStocks = calculateEstimatedStocks(report);
    setEstimatedStocks(estimatedStocks);
    console.log(report);
    console.log(estimatedStocks);

    setIsLoading(false);
  };

  async function getSaleDataForStore(
    storeId: string,
    fromDate: Date,
    toDate: Date,
  ) {
    const response = await getSalesDataForStoreApi(storeId, fromDate, toDate);
    if (response?.status === 200) {
      return response.data.data;
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getOpeningClosingStock(
    storeId: string,
    fromDate: Date,
    toDate: Date,
  ) {
    const response = await getOpeningClosingStockApi(storeId, fromDate, toDate);
    if (response?.status === 200) {
      return response.data.data;
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getOrdersByStoreDate(
    storeId: string,
    fromDate: Date,
    toDate: Date,
  ) {
    const response = await getOrdersByStoreDateApi(storeId, fromDate, toDate);
    if (response?.status === 200) {
      return response.data.data;
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getReturnsByStoreDate(
    storeId: string,
    fromDate: Date,
    toDate: Date,
  ) {
    const response = await getReturnsByFromToDateApi(storeId, fromDate, toDate);
    if (response?.status === 200) {
      return response.data.data;
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getAllStores() {
    const response = await getAllStoresApi();
    if (response?.status === 200) {
      setStore(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }
  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      setItems(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllStores();
    getAllItems();
  }, []);

  return (
    <main className="flex h-screen w-full flex-col gap-5 overflow-auto px-20">
      <Navbar />
      <section className="flex items-center justify-between">
        <p>Report for</p>
        <Select onValueChange={setSelectedStore} value={selectedStore}>
          <SelectTrigger className="w-[20%]">
            <SelectValue placeholder="Select a store" />
          </SelectTrigger>
          <SelectContent>
            {store.map((store) => (
              <SelectItem value={store.id} key={store.id}>
                {store.storeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover open={openFromDate} onOpenChange={setOpenFromDate}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-[20%] justify-between font-normal"
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
              className="w-[20%] justify-between font-normal"
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
          className="border-primary text-primary w-[10%] cursor-pointer"
          variant={"outline"}
          onClick={filterHandler}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle size={24} className="animate-spin" />
          ) : (
            <>
              <Funnel size={24} /> Filter
            </>
          )}
        </Button>
        <Button
          className="border-primary w-[10%] cursor-pointer text-white"
          onClick={exportHandler}
        >
          Export
        </Button>
        <Button
          className="border-primary text-primary w-[10%] cursor-pointer"
          variant={"outline"}
          onClick={() => nagivate("/report/sale-report")}
        >
          Sale data
        </Button>
      </section>
      {report.length === 0 && (
        <section className="flex h-[80vh] items-center justify-center rounded-lg border">
          <p>Select store and date to view reports</p>
        </section>
      )}
      {report.length > 0 && (
        <section className="flex h-[80vh] items-start justify-between overflow-y-auto rounded-lg border">
          <div className="flex h-full">
            {report.map((report, i) => (
              <table className="border" key={i}>
                <thead>
                  <tr className="">
                    <th
                      className="border-b py-2 text-center font-medium text-slate-500"
                      colSpan={6}
                    >
                      {report.date}
                    </th>
                  </tr>
                  <tr className="items-center gap-2">
                    {i === 0 && (
                      <th className="border-r px-2 font-medium whitespace-nowrap text-slate-500">
                        Item Names
                      </th>
                    )}
                    <th className="px-2 font-medium text-slate-500">Opening</th>
                    <th className="px-2 font-medium text-slate-500">
                      Purchase
                    </th>
                    <th className="px-2 font-medium text-slate-500">Return</th>
                    <th className="px-2 font-medium text-slate-500">Closing</th>
                    <th className="px-2 font-medium text-slate-500">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.map((items) => (
                    <tr key={items.item} className="h-10">
                      {i === 0 && (
                        <td className="border-r px-2 py-1 text-start font-medium">
                          {items.item}
                        </td>
                      )}
                      <td className="px-2 py-1 text-start font-medium">
                        {items.opening}
                      </td>
                      <td className="px-2 py-1 text-start font-medium">
                        {items.purchase}
                      </td>
                      <td className="px-2 py-1 text-start font-medium">
                        {items.return}
                      </td>
                      <td className="px-2 py-1 text-start font-medium">
                        {items.closing}
                      </td>
                      <td className="px-2 py-1 text-start font-medium">
                        {items.sales}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
          <table className="h-full border-l">
            <thead>
              <tr>
                <th className="px-2 py-2 font-medium text-slate-500">
                  Estimated
                </th>
                <th className="px-2 font-medium whitespace-nowrap text-slate-500">
                  Actual Closing
                </th>
              </tr>
              <tr>
                <th className="py-2 font-medium text-slate-500">End Date</th>
                <th className="font-medium text-slate-500">End Date</th>
              </tr>
            </thead>
            <tbody>
              {estimatedStocks.map((stock) => (
                <tr key={stock.item}>
                  <td className="py-2 text-center font-medium text-slate-500">
                    {stock.estimatedQty}
                  </td>
                  <td className="py-2 text-center font-medium text-slate-500">
                    {stock.actualQty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
