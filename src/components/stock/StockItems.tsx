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
    <table className="w-full">
        <thead>
          <tr className="text-[#797979]">
            <th className="text-start font-medium py-2 border px-2 ">
              Item Name
            </th>
            <th className="text-start font-medium  border px-2 ">Price Per Item</th>
            <th className="text-start font-medium  border px-2 ">Category</th>
            <th className="text-start font-medium  border px-2 ">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {Items?.map((item) => (
            <tr key={item.id}>
              <td className="text-start font-medium py-2 border px-2 content-start">
                {item.Item.name}
              </td>
              <td className="text-end font-medium border px-2">
                INR {item.Item.price}
              </td>
              <td className="text-end font-medium border px-2">
                {item.Item.category}
              </td>
              <td className="text-end font-medium border px-2">
                {item.quantity} {item.Item.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  )
}
