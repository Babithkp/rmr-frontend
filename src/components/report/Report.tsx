import { Upload } from "lucide-react";import Navbar from "../Navbar";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { getClosingStockOfTodayApi, getOpeningStockApi } from "@/api/store";
import { toast } from "react-toastify";
import { getAllBomsApi } from "@/api/item";

type ExcelRow = {
  "Row Labels": string;
  "Sum of Quantity"?: number;
};

type StoreItem = { name: string; quantity: number };
type StoreGroup = { storename: string; total: number; BOM: StoreItem[] };

type ItemDetail = {
  Items: {
    name: string;
    unit: string;
  };
  quantity: number;
};

type StoreItemGroup = {
  Store: {
    storeName: string;
  };
  Items: ItemDetail[];
  createdAt: string; // ISO timestamp
};

type StoreItemGroupList = StoreItemGroup[];

export interface ItemSet {
  itemId: string;
  quantity: string;
  name: string;
  Items?: {
    name: string;
    unit: string;
  };
}

type BOMItem = {
  Items: {
    name: string;
    unit: string;
  };
  quantity: number;
};

type ProductBOM = {
  id: string;
  name: string;
  Items: BOMItem[];
};

type BOMUsage = {
  name: string;
  quantity: number;
};

type StoreBOM = {
  storename: string;
  total: number;
  BOM: BOMUsage[];
};

type FinalBOMItem = {
  name: string;
  unit: string;
  quantity: number;
};

type StoreResult = {
  storeName: string;
  BOM: {
    name: string;
    quantity: number;
    Items: FinalBOMItem[];
  }[];
};

type Item = {
  name: string;
  unit: string;
  quantity: number;
};

type BOMEntry = {
  name: string;
  quantity: number;
  Items: Item[];
};

type StoreData = {
  storeName: string;
  BOM: BOMEntry[];
};

type AggregatedItem = {
  name: string;
  unit: string;
  quantity: number;
};

type AggregatedStore = {
  storeName: string;
  items: AggregatedItem[];
};

type StoreStock = {
  storeName: string;
  items: Item[];
};

type UsedItemInput = {
  Store: {
    storeName: string;
  };
  Items: {
    Items: {
      name: string;
    };
    quantity: number;
  }[];
};

type ExpectedItem = {
  name: string;
  unit: string;
  quantity: number;
};

type ExpectedStore = {
  storeName: string;
  items: ExpectedItem[];
};

type ActualUsedInput = {
  Store: { storeName: string };
  Items: {
    Items: {
      name: string;
      unit: string;
    };
    quantity: number;
  }[];
  createdAt: string;
};

type MergedItem = {
  name: string;
  unit: string;
  expected: number;
  actual: number;
};

type MergedStore = {
  storeName: string;
  items: MergedItem[];
};

function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function convertExcelDataToStoreWiseJson(
  data: ExcelRow[],
  storeNames: string[]
): StoreGroup[] {
  const normalizedStoreNames = storeNames.map(normalize);

  const result: StoreGroup[] = [];
  let currentStore: StoreGroup | null = null;

  for (const row of data) {
    const nameRaw = row["Row Labels"];
    const qty = row["Sum of Quantity"] || 0;

    const normalizedName = normalize(nameRaw);

    if (normalizedStoreNames.includes(normalizedName)) {
      if (currentStore) result.push(currentStore);
      currentStore = {
        storename: nameRaw,
        total: qty,
        BOM: [],
      };
    } else if (currentStore) {
      currentStore.BOM.push({ name: nameRaw, quantity: qty });
    }
  }

  if (currentStore) result.push(currentStore);
  return result;
}

function calculateItems(bom: ProductBOM, bomQty: number): FinalBOMItem[] {
  return bom.Items.map((item) => ({
    name: item.Items.name,
    unit: item.Items.unit,
    quantity: item.quantity * bomQty,
  }));
}

function generateDetailedBOMPerStore(
  storeBOMs: StoreBOM[],
  productBOMs: ProductBOM[]
): StoreResult[] {
  return storeBOMs.map((store) => {
    const detailedBOM = store.BOM.map((bomUsage) => {
      const bom = productBOMs.find(
        (p) =>
          p.name.toLowerCase().trim() === bomUsage.name.toLowerCase().trim()
      );

      if (!bom) return null;

      return {
        name: bom.name,
        quantity: bomUsage.quantity,
        Items: calculateItems(bom, bomUsage.quantity),
      };
    }).filter(Boolean) as StoreResult["BOM"];

    return {
      storeName: store.storename,
      BOM: detailedBOM,
    };
  });
}
function aggregateItemsByStore(data: StoreData[]): AggregatedStore[] {
  return data.map((store) => {
    const itemMap = new Map<string, AggregatedItem>();

    store.BOM.forEach((bom) => {
      bom.Items.forEach((item) => {
        const key = `${item.name}|${item.unit}`;
        if (itemMap.has(key)) {
          itemMap.get(key)!.quantity += item.quantity;
        } else {
          itemMap.set(key, { ...item });
        }
      });
    });

    return {
      storeName: store.storeName,
      items: Array.from(itemMap.values()),
    };
  });
}

function calculateRemainingUsage(
  openingStock: StoreStock[],
  totalItemsUsed: UsedItemInput[]
): StoreStock[] {
  const result: StoreStock[] = [];

  totalItemsUsed.forEach((usedStore) => {
    const store = openingStock.find(
      (s) =>
        s.storeName.toLowerCase().trim() ===
        usedStore.Store.storeName.toLowerCase().trim()
    );

    const remainingItems: Item[] = usedStore.Items.map((usedItem) => {
      const itemInOpening = store?.items.find(
        (i) =>
          i.name.toLowerCase().trim() ===
          usedItem.Items.name.toLowerCase().trim()
      );

      const openingQty = itemInOpening?.quantity || 0;
      const remainingQty = usedItem.quantity - openingQty;

      return {
        name: usedItem.Items.name,
        unit: itemInOpening?.unit || "",
        quantity: remainingQty,
      };
    });

    result.push({
      storeName: usedStore.Store.storeName,
      items: remainingItems,
    });
  });

  return result;
}


function mergeExpectedAndActual(
  expectedStock: ExpectedStore[],
  actualUsedStock: ActualUsedInput[]
): MergedStore[] {
  return expectedStock.map((expectedStore) => {
    const actualStore = actualUsedStock.find(
      (store) => store.Store.storeName.trim().toLowerCase() === expectedStore.storeName.trim().toLowerCase()
    );

    const mergedItems: MergedItem[] = expectedStore.items.map((expectedItem) => {
      const actualItemEntry = actualStore?.Items.find(
        (i) => i.Items.name.trim().toLowerCase() === expectedItem.name.trim().toLowerCase()
      );

      return {
        name: expectedItem.name,
        unit: expectedItem.unit,
        expected: expectedItem.quantity,
        actual: actualItemEntry?.quantity ?? 0
      };
    });

    return {
      storeName: expectedStore.storeName,
      items: mergedItems
    };
  });
}


export default function Report() {
  const [file, setFile] = useState<File>();
  const ref = useRef<HTMLInputElement>(null);
  const [closingStock, setClosingStock] = useState<StoreItemGroupList>([]);
  const [bom, setBom] = useState<ProductBOM[]>([]);
  const [bomList, setBomList] = useState<StoreResult[]>([]);
  const [openingStock, setOpeningStock] = useState<StoreItemGroupList>([]);
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [report, setReport] = useState<MergedStore[]>([]);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

      const result = convertExcelDataToStoreWiseJson(jsonData, storeNames);
      const newResult = generateDetailedBOMPerStore(result, bom);
      const totalItems = aggregateItemsByStore(newResult);
      const decrementedItems = calculateRemainingUsage(
        totalItems,
        openingStock
      );
      const finalRepost = mergeExpectedAndActual(decrementedItems, closingStock);
      setReport(finalRepost);

      setBomList(newResult);
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  async function getClosingStock() {
    const response = await getClosingStockOfTodayApi();
    if (response?.status === 200) {
      setClosingStock(response.data.data);
      console.log(response.data.data);
      const storeName = response.data.data.map(
        (item: StoreItemGroup) => item.Store?.storeName
      );
      setStoreNames(storeName);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getAllBoms() {
    const response = await getAllBomsApi();
    if (response?.status === 200) {
      setBom(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getOpeningStock() {
    const response = await getOpeningStockApi();
    if (response?.status === 200) {
      setOpeningStock(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getClosingStock();
    getAllBoms();
    getOpeningStock();
  }, []);

  return (
    <main className="px-20 flex flex-col gap-5 h-screen overflow-auto w-full">
      <Navbar />
      <section>
        <h1 className="text-2xl font-medium">Opening Stocks Submited Today</h1>
        <table className="w-full ">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2">Store Name</th>
              <th className="text-start font-medium py-2">Total</th>
              <th className="text-start font-medium py-2">Items</th>
            </tr>
          </thead>
          <tbody>
            {openingStock.map((closingStock, i) => (
              <tr key={i}>
                <td className="text-start font-medium border px-2">
                  {closingStock.Store?.storeName}
                </td>
                <td className="text-start font-medium border px-2">
                  {closingStock.Items.length}
                </td>
                <td className="text-start font-medium border px-2">
                  <ul>
                    {closingStock.Items.map((item, i) => (
                      <li key={i}>
                        {item.Items.name} - {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h1 className="text-2xl font-medium">Closing Stocks Submited Today</h1>
        <table className="w-full ">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2">Store Name</th>
              <th className="text-start font-medium py-2">Total</th>
              <th className="text-start font-medium py-2">Items</th>
            </tr>
          </thead>
          <tbody>
            {closingStock.map((closingStock, i) => (
              <tr key={i}>
                <td className="text-start font-medium border px-2">
                  {closingStock.Store?.storeName}
                </td>
                <td className="text-start font-medium border px-2">
                  {closingStock.Items.length}
                </td>
                <td className="text-start font-medium border px-2">
                  <ul>
                    {closingStock.Items.map((item, i) => (
                      <li key={i}>
                        {item.Items.name} - {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <p>BOM List</p>
        <table>
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2 border">BOM</th>
              <th className="text-start font-medium py-2 border">Items used</th>
            </tr>
          </thead>
          <tbody>
            {bom.map((bom, i) => (
              <tr key={i}>
                <td className="text-start font-medium border px-2">
                  {bom.name}
                </td>
                <td className="text-start font-medium border px-2">
                  {bom.Items.map((item, i) => (
                    <div key={i}>
                      {item.Items.name} - {item.quantity}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="flex flex-col gap-5">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
          ref={ref}
          className="hidden"
        />
        <div
          className="border font-medium border-dashed p-5 flex flex-col justify-center items-center h-50 cursor-pointer"
          onClick={() => ref.current?.click()}
        >
          <Upload size={44} />
          <p>Upload Sale Report</p>
        </div>
        <table className="w-full ">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2">Store Name</th>
              <th className="text-start font-medium py-2">BOM</th>
            </tr>
          </thead>
          <tbody>
            {bomList.map((bom, i) => (
              <tr key={i}>
                <td className="text-start font-medium border px-2">
                  {bom.storeName}
                </td>

                <td className="text-start font-medium border px-2">
                  {bom.BOM.map((item, i) => (
                    <div key={i}>
                      <p className="text-start py-1">
                        {item.name} - {item.quantity}
                      </p>
                      {item.Items.map((bomItem, i) => (
                        <p key={i} className="font-light">
                          {bomItem.name} - {bomItem.quantity} {bomItem.unit}
                        </p>
                      ))}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="pb-10">
        <p>Final Report </p>
        <table className="w-full ">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium py-2 border">Storename</th>
              <th className="text-start font-medium py-2 border">Items</th>
            </tr>
          </thead>
          <tbody>
            {report.map((store, i) => (
              <tr key={i}>
                <td className="text-start font-medium border px-2">
                  {store.storeName}
                </td>
                <td className="text-start font-medium border px-2">
                  {store.items.map((item, i) => (
                    <div key={i}>
                      {item.name}  (expected {item.expected}) / (Actual {item.actual}) 
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
