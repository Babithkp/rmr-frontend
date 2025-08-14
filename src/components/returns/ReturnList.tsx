import {
  approveReturnApi,
  declineReturnApi,
  getReturnsByPageApi,
} from "@/api/returns";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, LoaderCircle, Plus } from "lucide-react";

interface ReturnInputs {
  id: string;
  Items: {
    Items: {
      id: string;
      price: number;
      name: string;
      unit: string;
    };
    reason: string;
    quantity: number;
  }[];
  status: string;
  Store: {
    storeName: string;
  };
  createdAt: string;
}
export default function ReturnList({
  section,
  setSection,
}: {
  section: {
    returnsList: boolean;
    returnForm: boolean;
  };
  setSection: (section: { returnsList: boolean; returnForm: boolean }) => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [returns, setReturns] = useState<ReturnInputs[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnInputs | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
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

  const onDeclineHandler = async () => {
    setLoading(true);
    if (selectedReturn?.id) {
      const response = await declineReturnApi(selectedReturn?.id);
      if (response?.status === 200) {
        toast.success("Return declined successfully");
        setIsOpen(false);
        setSelectedReturn(null);
        getAllReturns();
      } else {
        toast.error("Something went wrong");
      }
    }
    setLoading(false);
  };

  const onApproveHandler = async () => {
    setLoading(true);
    if (selectedReturn?.id) {
      const response = await approveReturnApi(selectedReturn?.id);
      if (response?.status === 200) {
        toast.success("Return approved successfully");
        setIsOpen(false);
        setSelectedReturn(null);
        getAllReturns();
      } else {
        toast.error("Something went wrong");
      }
    }
    setLoading(false);
  };

  async function getAllReturns(store?: string) {
    const response = await getReturnsByPageApi(
      currentPage,
      itemsPerPage,
      store ? store : storeId,
    );
    if (response?.status === 200) {
      setReturns(response.data.data.returns);
      setTotalItems(response.data.data.count);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIndex, endIndex]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      const store = localStorage.getItem("store");
      if (store) {
        getAllReturns(JSON.parse(store).id);
        setStoreId(JSON.parse(store).id);
      }
    } else {
      setIsAdmin(true);
      getAllReturns();
    }
  }, []);

  return (
    <>
      {!isAdmin && (
        <section className="flex w-full items-center justify-between">
          <p className="text-xl font-medium">Returns </p>
          {section.returnsList && (
            <Button
              className="text-primary border-primary"
              variant={"outline"}
              onClick={() =>
                setSection({ returnsList: false, returnForm: true })
              }
            >
              Create New <Plus size={24} />
            </Button>
          )}
          {section.returnForm && (
            <Button
              className="text-primary border-primary"
              variant={"outline"}
              onClick={() =>
                setSection({ returnsList: true, returnForm: false })
              }
            >
              Back
            </Button>
          )}
        </section>
      )}
      <section className="flex justify-end">
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
      </section>
      <section className="rounded-lg border">
        <div></div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="py-1 font-medium text-slate-500">Store</th>
              <th className="font-medium text-slate-500">Date</th>
              <th className="font-medium text-slate-500">Time</th>
              <th className="font-medium text-slate-500">Total Item count</th>
              <th className="font-medium text-slate-500">Total Item value</th>
              <th className="font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((returnItem) => (
              <tr
                key={returnItem.id}
                className="cursor-pointer border-t hover:bg-slate-50"
                onClick={() => [setSelectedReturn(returnItem), setIsOpen(true)]}
              >
                <td className="py-1 text-center">
                  {returnItem.Store.storeName}
                </td>
                <td className="text-center">
                  {new Date(returnItem.createdAt).toLocaleDateString()}
                </td>
                <td className="text-center">
                  {new Date(returnItem.createdAt).toLocaleTimeString("en-US", {
                    minute: "2-digit",
                    hour: "2-digit",
                  })}
                </td>
                <td className="text-center">{returnItem.Items.length}</td>
                <td className="text-center">
                  {returnItem.Items.reduce((acc, item) => {
                    const price = item.Items.price * item.quantity;
                    return price + acc;
                  }, 0).toFixed(2)}
                </td>
                <td className="text-center">{returnItem.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  <th className="font-medium">Total(₹)</th>
                  <th className="font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {selectedReturn?.Items.map((items) => (
                  <tr key={items.Items.id} className="border">
                    <td className="py-1 text-center">{items.Items.name}</td>
                    <td className="py-1 text-center">{items.Items.unit}</td>
                    <td className="py-1 text-center">{items.quantity}</td>
                    <td className="py-1 text-center">
                      {items.quantity * items.Items.price}
                    </td>
                    <td className="max-w-80 py-1 text-center">
                      {items.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex w-full justify-between text-lg font-medium">
              <p>Total(₹)</p>
              <p>
                ₹{" "}
                {selectedReturn?.Items.reduce((acc, item) => {
                  return acc + item.quantity * item.Items.price;
                }, 0).toFixed(2)}
              </p>
            </div>

            {isAdmin && selectedReturn?.status === "Pending" && (
              <div className="flex w-full justify-end gap-5">
                <Button
                  disabled={loading}
                  variant={"outline"}
                  className="border-primary text-primary"
                  onClick={onDeclineHandler}
                >
                  {loading ? (
                    <LoaderCircle size={24} className="animate-spin" />
                  ) : (
                    "Decline"
                  )}
                </Button>
                <Button disabled={loading} onClick={onApproveHandler}>
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
    </>
  );
}
