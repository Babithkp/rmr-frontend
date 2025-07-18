import { useEffect, useState } from "react";import {
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { LoaderCircle, Pencil, Plus, Trash } from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { createItemApi, deleteItemApi, getAllItemsApi } from "@/api/item";
import { toast } from "react-toastify";

export interface ItemInputs {
  id: string;
  name: string;
  GST: string;
  price: number;
  imageUrl: string;
  category: string;
  unit: string;
}

export default function ItemList() {
  const [formStatus, setFormStatus] = useState("New");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isItemNameAvailable, setIsItemNameAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemInputs[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ItemInputs>();

  const onSubmit: SubmitHandler<ItemInputs> = async (data) => {
    setIsLoading(true);
    const response = await createItemApi(data);
    if (response?.status === 200) {
      toast.success("Item created successfully");
      setIsCreateModalOpen(false);
      getAllItems();
    }
    if (response?.status === 204) {
      setIsItemNameAvailable(true);
      setTimeout(() => {
        setIsItemNameAvailable(false);
      }, 3000);
    } else {
      toast.error("Something went wrong");
    }
    setIsLoading(false);
  };

  async function deleteItemHandler(id: string) {
    const response = await deleteItemApi(id);
    if (response?.status === 200) {
      toast.success("Item deleted successfully");
      getAllItems();
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
    getAllItems();
  }, []);
  return (
    <section className="w-full px-20 ">
      <div className="w-full p-2 px-5 border rounded-2xl">
        <div className="flex justify-between items-center ">
          <p className="text-lg font-medium">Items</p>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger
              className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-2 rounded-2xl p-2 px-4 font-medium text-white"
              onClick={() => [setFormStatus("New"), reset()]}
            >
              <Plus color="white" size={20} />
              Create new
            </DialogTrigger>
            <DialogContent className="min-w-5xl">
              <DialogHeader>
                <DialogTitle>
                  {formStatus == "New" ? "Create Store" : "Edit Store"}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription></DialogDescription>
              <form
                className="flex flex-wrap justify-between gap-5"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="w-[23%]">
                  <div className="flex w-full flex-col gap-2">
                    <label>Item Name</label>
                    <input
                      type="text"
                      className="border-primary rounded-md border p-1 py-2 pl-2"
                      {...register("name", {
                        required: true,
                        minLength: 3,
                      })}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      Name must be atleast 3 characters
                    </p>
                  )}
                  {isItemNameAvailable && (
                    <p className="mt-1 text-sm text-red-500">
                      Item Name already exists, please try another one
                    </p>
                  )}
                </div>
                <div className="w-[23%]">
                  <div className="flex w-full flex-col gap-2">
                    <label>Item GST</label>
                    <input
                      type="text"
                      className="border-primary rounded-md border p-1 py-2 pl-2"
                      {...register("GST", {
                        required: true,
                      })}
                    />
                  </div>
                  {errors.GST && (
                    <p className="mt-1 text-sm text-red-500">GST is required</p>
                  )}
                </div>
                <div className="w-[23%]">
                  <div className="flex w-full flex-col gap-2">
                    <label>Item Price</label>
                    <input
                      type="text"
                      className="border-primary rounded-md border p-1 py-2 pl-2"
                      {...register("price", {
                        required: true,
                      })}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">
                      Item price is required
                    </p>
                  )}
                </div>
                <div className="w-[23%]">
                  <div className="flex w-full flex-col gap-2">
                    <label>Unit of measurement</label>
                    <input
                      type="text"
                      className="border-primary rounded-md border p-1 py-2 pl-2"
                      {...register("unit", {
                        required: true,
                      })}
                    />
                  </div>
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-500">
                      Item unit is required
                    </p>
                  )}
                </div>
                <div className="w-[23%]">
                  <div className="flex w-full flex-col gap-2">
                    <label>Item Category</label>
                    <Controller
                      name="category"
                      control={control}
                      defaultValue={""}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            className="w-full"
                            style={{ border: "1px solid #64BAFF" }}
                          >
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consumables">
                              Consumables
                            </SelectItem>
                            <SelectItem value="Finished Goods">
                              Finished Goods
                            </SelectItem>
                            <SelectItem value="Flavours & Essence">
                              Flavours & Essence
                            </SelectItem>
                            <SelectItem value="Fruits">Fruits</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-500">
                      Item unit is required
                    </p>
                  )}
                </div>
                <div className="flex w-full justify-end">
                  <Button disabled={isLoading}>
                    {isLoading ? (
                      <LoaderCircle size={24} className="animate-spin" />
                    ) : (
                      "Create Item"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <table className="h-full w-full mt-5">
            <thead>
              <tr className="text-[#797979]">
                <th className="text-start font-medium py-2">Item Name</th>
                <th className="text-start font-medium">Item GST</th>
                <th className="text-start font-medium">Item Price</th>
                <th className="text-start font-medium">Unit</th>
                <th className="text-end font-medium">Category</th>
                <th className="text-end font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="text-start font-medium py-2">{item.name}</td>
                  <td className="text-start font-medium">{item.GST}%</td>
                  <td className="text-start font-medium">INR {item.price}</td>
                  <td className="text-start font-medium">{item.unit}</td>
                  <td className="text-end font-medium">{item.category}</td>
                  <td className="flex items-center h-full gap-2 justify-end">
                    <Pencil size={20} className="cursor-pointer" />
                    <Trash
                      size={20}
                      color="red"
                      className="cursor-pointer"
                      onClick={() => deleteItemHandler(item.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
