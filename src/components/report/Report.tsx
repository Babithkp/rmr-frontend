import { ChevronDownIcon } from "lucide-react";
import Navbar from "../Navbar";
import { useEffect, useState } from "react";
import { getAllStoresApi } from "@/api/store";
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
// import { getSalesDataForStoreApi } from "@/api/sales";

// type StoreItem = { name: string; quantity: number };
// type StoreGroup = { storename: string; total: number; BOM: StoreItem[] };

// type ItemDetail = {
//   Items: {
//     name: string;
//     unit: string;
//   };
//   quantity: number;
// };

// type StoreItemGroup = {
//   Store: {
//     storeName: string;
//   };
//   Items: ItemDetail[];
//   createdAt: string; // ISO timestamp
// };

// type StoreItemGroupList = StoreItemGroup[];

// export interface ItemSet {
//   itemId: string;
//   quantity: string;
//   name: string;
//   Items?: {
//     name: string;
//     unit: string;
//   };
// }

// type BOMItem = {
//   Items: {
//     name: string;
//     unit: string;
//   };
//   quantity: number;
// };

// type ProductBOM = {
//   id: string;
//   name: string;
//   Items: BOMItem[];
// };

// type BOMUsage = {
//   name: string;
//   quantity: number;
// };

// type StoreBOM = {
//   storename: string;
//   total: number;
//   BOM: BOMUsage[];
// };

// type FinalBOMItem = {
//   name: string;
//   unit: string;
//   quantity: number;
// };

// type StoreResult = {
//   storeName: string;
//   BOM: {
//     name: string;
//     quantity: number;
//     Items: FinalBOMItem[];
//   }[];
// };

// type Item = {
//   name: string;
//   unit: string;
//   quantity: number;
// };

// type BOMEntry = {
//   name: string;
//   quantity: number;
//   Items: Item[];
// };

// type StoreData = {
//   storeName: string;
//   BOM: BOMEntry[];
// };

// type AggregatedItem = {
//   name: string;
//   unit: string;
//   quantity: number;
// };

// type AggregatedStore = {
//   storeName: string;
//   items: AggregatedItem[];
// };

// type StoreStock = {
//   storeName: string;
//   items: Item[];
// };

// type UsedItemInput = {
//   Store: {
//     storeName: string;
//   };
//   Items: {
//     Items: {
//       name: string;
//     };
//     quantity: number;
//   }[];
// };

// type ExpectedItem = {
//   name: string;
//   unit: string;
//   quantity: number;
// };

// type ExpectedStore = {
//   storeName: string;
//   items: ExpectedItem[];
// };

// type ActualUsedInput = {
//   Store: { storeName: string };
//   Items: {
//     Items: {
//       name: string;
//       unit: string;
//     };
//     quantity: number;
//   }[];
//   createdAt: string;
// };

// type MergedItem = {
//   name: string;
//   unit: string;
//   expected: number;
//   actual: number;
// };

// type MergedStore = {
//   storeName: string;
//   items: MergedItem[];
// };

// function normalize(str: string): string {
//   return str.toLowerCase().replace(/\s+/g, " ").trim();
// }

// function convertExcelDataToStoreWiseJson(
//   data: ExcelRow[],
//   storeNames: string[],
// ): StoreGroup[] {
//   const normalizedStoreNames = storeNames.map(normalize);

//   const result: StoreGroup[] = [];
//   let currentStore: StoreGroup | null = null;

//   for (const row of data) {
//     const nameRaw = row["Row Labels"];
//     const qty = row["Sum of Quantity"] || 0;

//     const normalizedName = normalize(nameRaw);

//     if (normalizedStoreNames.includes(normalizedName)) {
//       if (currentStore) result.push(currentStore);
//       currentStore = {
//         storename: nameRaw,
//         total: qty,
//         BOM: [],
//       };
//     } else if (currentStore) {
//       currentStore.BOM.push({ name: nameRaw, quantity: qty });
//     }
//   }

//   if (currentStore) result.push(currentStore);
//   return result;
// }

// function calculateItems(bom: ProductBOM, bomQty: number): FinalBOMItem[] {
//   return bom.Items.map((item) => ({
//     name: item.Items.name,
//     unit: item.Items.unit,
//     quantity: item.quantity * bomQty,
//   }));
// }

// function generateDetailedBOMPerStore(
//   storeBOMs: StoreBOM[],
//   productBOMs: ProductBOM[],
// ): StoreResult[] {
//   return storeBOMs.map((store) => {
//     const detailedBOM = store.BOM.map((bomUsage) => {
//       const bom = productBOMs.find(
//         (p) =>
//           p.name.toLowerCase().trim() === bomUsage.name.toLowerCase().trim(),
//       );

//       if (!bom) return null;

//       return {
//         name: bom.name,
//         quantity: bomUsage.quantity,
//         Items: calculateItems(bom, bomUsage.quantity),
//       };
//     }).filter(Boolean) as StoreResult["BOM"];

//     return {
//       storeName: store.storename,
//       BOM: detailedBOM,
//     };
//   });
// }

// function aggregateItemsByStore(data: StoreData[]): AggregatedStore[] {
//   return data.map((store) => {
//     const itemMap = new Map<string, AggregatedItem>();

//     store.BOM.forEach((bom) => {
//       bom.Items.forEach((item) => {
//         const key = `${item.name}|${item.unit}`;
//         if (itemMap.has(key)) {
//           itemMap.get(key)!.quantity += item.quantity;
//         } else {
//           itemMap.set(key, { ...item });
//         }
//       });
//     });

//     return {
//       storeName: store.storeName,
//       items: Array.from(itemMap.values()),
//     };
//   });
// }

// function calculateRemainingUsage(
//   openingStock: StoreStock[],
//   totalItemsUsed: UsedItemInput[],
// ): StoreStock[] {
//   const result: StoreStock[] = [];

//   totalItemsUsed.forEach((usedStore) => {
//     const store = openingStock.find(
//       (s) =>
//         s.storeName.toLowerCase().trim() ===
//         usedStore.Store.storeName.toLowerCase().trim(),
//     );

//     const remainingItems: Item[] = usedStore.Items.map((usedItem) => {
//       const itemInOpening = store?.items.find(
//         (i) =>
//           i.name.toLowerCase().trim() ===
//           usedItem.Items.name.toLowerCase().trim(),
//       );

//       const openingQty = itemInOpening?.quantity || 0;
//       const remainingQty = usedItem.quantity - openingQty;

//       return {
//         name: usedItem.Items.name,
//         unit: itemInOpening?.unit || "",
//         quantity: remainingQty,
//       };
//     });

//     result.push({
//       storeName: usedStore.Store.storeName,
//       items: remainingItems,
//     });
//   });

//   return result;
// }

// function mergeExpectedAndActual(
//   expectedStock: ExpectedStore[],
//   actualUsedStock: ActualUsedInput[],
// ): MergedStore[] {
//   return expectedStock.map((expectedStore) => {
//     const actualStore = actualUsedStock.find(
//       (store) =>
//         store.Store.storeName.trim().toLowerCase() ===
//         expectedStore.storeName.trim().toLowerCase(),
//     );

//     const mergedItems: MergedItem[] = expectedStore.items.map(
//       (expectedItem) => {
//         const actualItemEntry = actualStore?.Items.find(
//           (i) =>
//             i.Items.name.trim().toLowerCase() ===
//             expectedItem.name.trim().toLowerCase(),
//         );

//         return {
//           name: expectedItem.name,
//           unit: expectedItem.unit,
//           expected: expectedItem.quantity,
//           actual: actualItemEntry?.quantity ?? 0,
//         };
//       },
//     );

//     return {
//       storeName: expectedStore.storeName,
//       items: mergedItems,
//     };
//   });
// }

// interface SaleData {
//   id: string;
//   storeId: string;
//   storeName: string;
//   Items: {
//     itemId: string;
//     quantity: number;
//   }[];
// }

interface Store {
  id: string;
  storeName: string;
}

export default function Report() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [openToDate, setOpenToDate] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [saleData, setSaleData] = useState<SaleData[]>([]);
  const [store, setStore] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");

  const nagivate = useNavigate();

  // const filterHandler = async () => {
  //   if (selectedStore === "") {
  //     toast.warn("Please select a store");
  //     return;
  //   }

  //   getSaleDataForStore(selectedStore);
  // };

  // async function getAllBoms() {
  //   const response = await getAllBomsApi();
  //   if (response?.status === 200) {
  //     setBom(response.data.data);
  //   } else {
  //     toast.error("Something went wrong");
  //   }
  // }

  // async function getSaleDataForStore(storeId: string) {
  //   setIsLoading(true);
  //   const response = await getSalesDataForStoreApi(storeId);
  //   if (response?.status === 200) {
  //     setSaleData(response.data.data);
  //     console.log(response.data.data);

  //   } else {
  //     toast.error("Something went wrong");
  //   }
  //   setIsLoading(false);
  // }

  async function getAllStores() {
    const response = await getAllStoresApi();
    if (response?.status === 200) {
      setStore(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllStores();
  }, []);

  return (
    <main className="flex h-screen w-full flex-col gap-5 overflow-auto px-20">
      <Navbar />
      <section className="flex items-center justify-between">
        <p>Report for</p>
        <Select onValueChange={setSelectedStore} value={selectedStore}>
          <SelectTrigger>
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
              className="w-100 justify-between font-normal"
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
              className="w-100 justify-between font-normal"
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

        {/* <Button
          className="border-primary text-primary w-50 cursor-pointer"
          variant={"outline"}
          onClick={filterHandler}
        >
          {isLoading ? (
            <LoaderCircle size={24} className="animate-spin" />
          ) : (
            <>
              <Funnel size={24} /> Filter
            </>
          )}
        </Button> */}
        <Button
          className="border-primary w-50 cursor-pointer text-white"
          // onClick={exportOrderSummaryToExcel}
        >
          Export
        </Button>
        <Button
          className="border-primary text-primary w-50 cursor-pointer"
          variant={"outline"}
          onClick={() => nagivate("/report/sale-report")}
        >
          Sale data
        </Button>
      </section>
      <section className="flex h-[80vh] items-center justify-center rounded-lg border">
        <p>Select store and date to view reports</p>
      </section>
    </main>
  );
}
