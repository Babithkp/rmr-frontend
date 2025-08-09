import { LoaderCircle, Upload } from "lucide-react";
import Navbar from "../Navbar";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import * as XLSX from "xlsx";
import { getAllStoresApi } from "@/api/store";
import { toast } from "react-toastify";
import { createSalesDataApi } from "@/api/sales";
import { getAllBomsApi } from "@/api/item";

type ExcelRow = {
  "Row Labels": string;
  "Sum of Quantity"?: number;
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
  id: string;
  storeName: string;
  BOM: BOMEntry[];
};

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

type FinalBOMItem = {
  name: string;
  unit: string;
  quantity: number;
};

type StoreResult = {
  storeId: string;
  storeName: string;
  BOM: {
    name: string;
    quantity: number;
    Items: FinalBOMItem[];
  }[];
};

type BOMUsage = {
  name: string;
  quantity: number;
};

type StoreBOM = {
  storeId: string | null;
  storename: string;
  total: number;
  BOM: BOMUsage[];
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

interface StoreNameObj {
  storeId: string;
  storeName: string;
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
  productBOMs: ProductBOM[],
): StoreResult[] {
  return storeBOMs.map((store) => {
    const detailedBOM = store.BOM.map((bomUsage) => {
      const bom = productBOMs.find(
        (p) =>
          p.name.toLowerCase().trim() === bomUsage.name.toLowerCase().trim(),
      );

      if (!bom) return null;

      return {
        name: bom.name,
        quantity: bomUsage.quantity,
        Items: calculateItems(bom, bomUsage.quantity),
      };
    }).filter(Boolean) as StoreResult["BOM"];

    return {
      storeId: store.storeId!,
      storeName: store.storename,
      BOM: detailedBOM,
    };
  });
}
function aggregateItemsByStore(data: StoreResult[]): AggregatedStore[] {
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
      storeId: store.storeId,
      storeName: store.storeName,
      items: Array.from(itemMap.values()),
    };
  });
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function convertExcelDataToStoreWiseJson(
  data: ExcelRow[],
  storeNames: StoreNameObj[],
): StoreBOM[] {
  const normalizedStoreNames = storeNames.map((s) => normalize(s.storeName));

  const result: StoreBOM[] = [];
  let currentStore: StoreBOM | null = null;

  for (const row of data) {
    const nameRaw = row["Row Labels"];
    const qty = row["Sum of Quantity"] || 0;

    const normalizedName = normalize(nameRaw);

    if (normalizedStoreNames.includes(normalizedName)) {
      if (currentStore) result.push(currentStore);

      const storeObj = storeNames.find(
        (s) => normalize(s.storeName) === normalizedName,
      );
      currentStore = {
        storeId: storeObj?.storeId || "",
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

export default function SaleReport() {
  const [file, setFile] = useState<File | null>();
  const [storeNames, setStoreNames] = useState<
    {
      storeId: string;
      storeName: string;
    }[]
  >([]);
  const [report, setReport] = useState<AggregatedStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [bom, setBom] = useState<ProductBOM[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSumbit = async () => {
    if (report.length === 0) {
      toast.warn("Please upload data");
      return;
    }
    const data = {
      items: report,
    };
    setLoading(true);

    const response = await createSalesDataApi(data);
    if (response?.status === 200) {
      toast.success("Sales data created successfully");
      setReport([]);
      setFile(null);
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

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
      const resultByStore = aggregateItemsByStore(newResult);
      setReport(resultByStore);
      console.log(resultByStore);
      
    };

    reader.readAsArrayBuffer(file);
  }, [file, storeNames]);

  async function getAllStores() {
    const response = await getAllStoresApi();
    if (response?.status === 200) {
      setStoreNames(
        response.data.data.map((store: StoreData) => {
          return {
            storeId: store.id,
            storeName: store.storeName,
          };
        }),
      );
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

  useEffect(() => {
    getAllStores();
    getAllBoms();
  }, []);

  return (
    <main className="flex w-full flex-col gap-5 px-20">
      <Navbar />
      <button
        className="flex h-[20vh] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#FF71A2] bg-[#FFECF3] text-[#FF71A2]"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={40} />
        <p className="font-medium">Upload Sale data from POS</p>
        <input
          type="file"
          className="hidden"
          ref={inputRef}
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      </button>
      <section className="flec flex h-[60vh] items-center justify-center overflow-auto rounded-lg border">
        {!file && <p>Upload Data to view</p>}
        {file && (
          <table className="w-full">
            <thead className="border">
              <tr className="text-[#797979]">
                <th className="border px-2 py-2 text-start font-medium">
                  Storename
                </th>
                <th className="border px-2 py-2 text-start font-medium">
                  Items
                </th>
              </tr>
            </thead>
            <tbody>
              {report.map((store, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1 text-start font-medium">
                    {store.storeName}
                  </td>
                  <td className="border px-2 py-1 text-start font-medium">
                    {store.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <p>{item.name}</p>
                        <p>{item.quantity}</p>
                        <p>{item.unit}</p>
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <Button onClick={onSumbit} className="text-white" disabled={loading}>
        {loading ? (
          <LoaderCircle size={24} className="animate-spin" />
        ) : (
          "Upload data"
        )}
      </Button>
    </main>
  );
}
