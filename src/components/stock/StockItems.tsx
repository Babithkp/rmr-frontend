import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getStoreItemsApi } from "@/api/store";

type Item = {
  id: string;
  quantity: number;
  Item: {
    name: string;
    GST: string;
    price: number;
    category: string;
    unit: string;
  };
};

export default function StockItems() {
  const [Items, setItems] = useState<Item[]>([]);

  async function getAllItems(storeId: string) {
    const response = await getStoreItemsApi(storeId);
    if (response?.status === 200) {
      setItems(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }
  useEffect(() => {
    const store = localStorage.getItem("store");
    if (store) {
      getAllItems(JSON.parse(store).id);
    }
  }, []);

  return (
    <section >
      <table className="w-full">
        <thead>
          <tr className="text-[#797979]">
            <th className="border px-2 py-2 text-start font-medium">
              Item Name
            </th>

            <th className="border px-2 text-start font-medium">Category</th>
            <th className="border px-2 text-start font-medium">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {Items?.map((item) => (
            <tr key={item.id}>
              <td className="content-start border px-2 py-2 text-start font-medium">
                {item.Item.name}
              </td>
              <td className="border px-2 text-end font-medium">
                {item.Item.category}
              </td>
              <td className="border px-2 text-end font-medium">
                {item.quantity} {item.Item.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
