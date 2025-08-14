import { useEffect, useRef, useState } from "react";
import {
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
import {
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash,
  Upload,
} from "lucide-react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import {
  createItemApi,
  deleteItemApi,
  getAllItemsApi,
  updateItemApi,
} from "@/api/item";
import { toast } from "react-toastify";
import { uploadImagesApi } from "@/api/admin";
import { getItemIdApi } from "@/api/settings";

export interface ItemInputs {
  id: string;
  itemId: string;
  name: string;
  price: number;
  GST: string;
  netWeight: number | string;
  grossWeight: number | string;
  imageUrl: string;
  quantityUnit: number;
  unit: string;
  category: string;
  quantityType: string;
}

export default function ItemList({
  setSections,
}: {
  setSections: ({
    itemList,
    bomList,
  }: {
    itemList: boolean;
    bomList: boolean;
  }) => void;
}) {
  const [formStatus, setFormStatus] = useState("New");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isItemIdAvailable, setIsItemIdAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemInputs[]>([]);
  const [image, setImage] = useState<File | null | string>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [selectedItem, setSelectedItem] = useState<ItemInputs | null>(null);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);
  const [itemId, setItemId] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemInputs>();

  const quantityType = watch("quantityType");

  const onSubmit: SubmitHandler<ItemInputs> = async (data) => {
    setIsLoading(true);

    if (formStatus === "New") {
      if (image) {
        const formData = new FormData();
        const img = image as File;
        formData.append("file", img, new Date().getTime() + img.name);
        const response = await uploadImagesApi(formData);
        if (response?.status === 200) {
          data.imageUrl = response.data.data[0].url;
          toast.success("Image uploaded successfully");
        }
      } else {
        data.imageUrl = "";
      }
      const response = await createItemApi(data);
      if (response?.status === 200) {
        toast.success("Item created successfully");
        setIsCreateModalOpen(false);
        reset();
        setImage(null);
        getAllItems();
        getItemId();
      } else if (response?.status === 204) {
        setIsItemIdAvailable(true);
        setTimeout(() => {
          setIsItemIdAvailable(false);
        }, 3000);
      } else {
        toast.error("Something went wrong");
      }
    } else if (formStatus === "editing") {
      if (typeof image === "string") {
        data.imageUrl = image;
      } else {
        if (image) {
          const formData = new FormData();
          const img = image as File;
          formData.append("file", img, new Date().getTime() + img.name);
          const response = await uploadImagesApi(formData);
          if (response?.status === 200) {
            data.imageUrl = response.data.data[0].url;
            toast.success("Image uploaded successfully");
          }
        } else {
          data.imageUrl = "";
        }
      }
      const response = await updateItemApi(data);
      if (response && response?.status === 200) {
        toast.success("Item updated successfully");
        setIsCreateModalOpen(false);
        getAllItems();
        setSelectedItem(null);
      } else {
        toast.error("Something went wrong");
      }
    }
    setIsLoading(false);
  };

  async function deleteItemHandler() {
    if (selectedItem?.id) {
      const response = await deleteItemApi(selectedItem?.id);
      if (response?.status === 200) {
        toast.success("Item deleted successfully");
        setIsItemDetailsModalOpen(false);
        getAllItems();
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  const setDataToEditDetails = (data: ItemInputs) => {
    setValue("id", data.id);
    setValue("itemId", data.itemId);
    setValue("name", data.name);
    setValue("price", data.price);
    setValue("GST", data.GST);
    setValue("netWeight", data.netWeight);
    setValue("grossWeight", data.grossWeight);
    setValue("quantityUnit", data.quantityUnit);
    setValue("unit", data.unit);
    setValue("category", data.category);
    setValue("quantityType", data.quantityType);
    setImage(data.imageUrl);
  };

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      const items = response.data.data;
      setItems(
        [...items].sort((a: ItemInputs, b: ItemInputs) =>
          a.category.localeCompare(b.category),
        ),
      );
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getItemId() {
    const response = await getItemIdApi();
    if (response?.status === 200) {
      if (formStatus === "New") {
        setItemId("IM" + response.data.data);
      }
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (itemId) {
      setValue("itemId", itemId);
    }
  }, [itemId, setValue]);

  useEffect(() => {
    getAllItems();
    getItemId();
  }, []);

  return (
    <>
      <div className="flex w-full gap-5 ">
        <div className="flex w-full items-center gap-2 rounded-md border px-2">
          <Search className="text-slate-600" size={20} />
          <input
            type="text"
            className="w-full outline-none"
            placeholder="Search items"
          />
        </div>

        <Button
          className="bg-slate-500 text-white"
          onClick={() =>
            setSections({
              itemList: false,
              bomList: true,
            })
          }
        >
          View BOM
        </Button>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger
            className="border-primary text-primary flex cursor-pointer items-center gap-2 rounded-md border p-1 px-2 text-sm whitespace-nowrap"
            onClick={() => [setFormStatus("New"), reset()]}
          >
            Create item
            <Plus size={20} />
          </DialogTrigger>
          <DialogContent className="min-w-5xl max-xl:min-w-3xl h-[80vh] overflow-auto max-sm:min-w-sm">
            <DialogHeader>
              <DialogTitle>
                {formStatus == "New" ? "Create BOM" : "Edit BOM"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <form
              className="flex flex-wrap justify-between gap-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="w-[48%] max-sm:w-full">
                <div className="flex w-full flex-col gap-2">
                  <label>Item ID</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2 pl-2"
                    {...register("itemId", {
                      required: true,
                      minLength: 3,
                    })}
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    disabled
                  />
                </div>
                {errors.itemId && (
                  <p className="mt-1 text-sm text-red-500">
                    Item Id be atleast 3 characters
                  </p>
                )}
                {isItemIdAvailable && (
                  <p className="mt-1 text-sm text-red-500">
                    Item ID already exists, please try another one
                  </p>
                )}
              </div>
              <div className="w-[48%] max-sm:w-full">
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
              </div>
              <div className="w-[48%] max-sm:w-full">
                <div className="flex w-full flex-col gap-2">
                  <label>Price</label>
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
              <div className="w-[48%] max-sm:w-full">
                <div className="flex w-full flex-col gap-2">
                  <label>Quantity Type</label>
                  <Controller
                    name="quantityType"
                    control={control}
                    defaultValue={""}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("netWeight", "");
                          setValue("grossWeight", "");
                        }}
                        value={field.value}
                      >
                        <SelectTrigger
                          className="w-full"
                          style={{ border: "1px solid #64BAFF" }}
                        >
                          <SelectValue placeholder="Select Quantity Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full only">Full only</SelectItem>
                          <SelectItem value="Loose">Loose</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.quantityType && (
                  <p className="mt-1 text-sm text-red-500">
                    select Quantity Type is required
                  </p>
                )}
              </div>

              <div className="w-[48%] max-sm:w-full">
                <div className="flex w-full flex-col gap-2">
                  <label>Net Weight</label>
                  <input
                    type="text"
                    disabled={quantityType !== "Loose"}
                    className="border-primary rounded-md border p-1 py-2 pl-2"
                    style={{
                      backgroundColor:
                        quantityType !== "Loose" ? "#F5F5F5" : "",
                    }}
                    {...register("netWeight", {
                      required: quantityType === "Loose",
                    })}
                  />
                </div>
                {errors.netWeight && (
                  <p className="mt-1 text-sm text-red-500">
                    Net Weight is required
                  </p>
                )}
              </div>
              <div className="w-[48%] max-sm:w-full">
                <div className="flex w-full flex-col gap-2">
                  <label>Gross Weight</label>
                  <input
                    type="text"
                    disabled={quantityType !== "Loose"}
                    style={{
                      backgroundColor:
                        quantityType !== "Loose" ? "#F5F5F5" : "",
                    }}
                    className="border-primary rounded-md border p-1 py-2 pl-2"
                    {...register("grossWeight", {
                      required: quantityType === "Loose",
                    })}
                  />
                </div>
                {errors.grossWeight && (
                  <p className="mt-1 text-sm text-red-500">
                    Gross Weight is required
                  </p>
                )}
              </div>

              <div className="flex w-full gap-5 max-sm:flex-col max-sm:gap-2">
                <button
                  className="border-primary grid w-[40%] gap-2 rounded-lg border border-dashed text-xs text-slate-500 max-sm:w-full  max-sm:h-50"
                  onClick={() => imageRef.current?.click()}
                  type="button"
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={imageRef}
                    onChange={(e) => setImage(e.target.files![0])}
                    accept="image/*"
                  />
                  {!image && (
                    <div className="flex flex-col items-center justify-center">
                      <Upload size={30} />
                      <p>Upload Image</p>
                    </div>
                  )}
                  {image && (
                    <img
                      src={
                        typeof image === "string"
                          ? image
                          : URL.createObjectURL(image)
                      }
                      className="h-40 w-full rounded-md object-cover"
                      alt="Uploaded preview"
                    />
                  )}
                </button>
                <div className="flex  flex-wrap justify-between gap-5 max-xl:w-[60%] max-sm:w-full">
                  <div className="w-full ">
                    <div className="flex w-full flex-col gap-2">
                      <label>Quantity / unit</label>
                      <input
                        type="text"
                        className="border-primary rounded-md border p-1 py-2 pl-2"
                        {...register("quantityUnit", {
                          required: true,
                        })}
                      />
                    </div>
                    {errors.quantityUnit && (
                      <p className="mt-1 text-sm text-red-500">
                        Quantity Unit is required
                      </p>
                    )}
                  </div>
                  <div className="w-full">
                    <div className="flex w-full flex-col gap-2">
                      <label>unit</label>
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
                        Items Unit is required
                      </p>
                    )}
                  </div>
                  <div className="w-full">
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
                              <SelectItem value="Consumables">
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
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">
                        Category is required
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <div className="flex w-full flex-col gap-2">
                      <label>GST</label>
                      <input
                        type="text"
                        className="border-primary rounded-md border p-1 py-2 pl-2"
                        {...register("GST", {
                          required: true,
                        })}
                      />
                    </div>
                    {errors.GST && (
                      <p className="mt-1 text-sm text-red-500">
                        Item GST is required
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-end">
                <Button
                  disabled={isLoading}
                  className="cursor-pointer text-white"
                >
                  {isLoading ? (
                    <LoaderCircle size={24} className="animate-spin" />
                  ) : formStatus === "New" ? (
                    "Create Item"
                  ) : (
                    "Update Item"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <section className="w-full ">
        <table className="mt-5 h-full w-full">
          <thead>
            <tr className="border text-[#797979]">
              <th className="py-2 text-center font-medium">Item ID</th>
              <th className="text-center font-medium">Item Name</th>
              <th className="text-center font-medium">Unit</th>
              <th className="text-center font-medium">Price</th>
              <th className="text-center font-medium">Category</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer border hover:bg-slate-50"
                onClick={() => [
                  setSelectedItem(item),
                  setIsItemDetailsModalOpen(true),
                ]}
              >
                <td className="text-center font-medium">{item.itemId}</td>
                <td className="text-center font-medium">{item.name}</td>
                <td className="text-center font-medium">{item.unit}</td>
                <td className="text-center font-medium">INR {item.price}</td>
                <td className="text-center font-medium">{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Dialog
        open={isItemDetailsModalOpen}
        onOpenChange={setIsItemDetailsModalOpen}
      >
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl max-xl:min-w-2xl max-sm:min-w-sm max-sm:p-3 text-sm">
          <DialogHeader className="flex">
            <div className="flex items-start justify-between pr-10">
              <DialogTitle className="text-primary">
                {selectedItem?.itemId} - {selectedItem?.name}
              </DialogTitle>
              <div className="flex gap-5">
                <button
                  className="cursor-pointer"
                  onClick={() => [
                    setFormStatus("editing"),
                    setIsItemDetailsModalOpen(false),
                    setDataToEditDetails(selectedItem!),
                    setIsCreateModalOpen(true),
                  ]}
                >
                  <Pencil size={20} />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger className="cursor-pointer">
                    <Trash size={20} color="red" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Alert!</AlertDialogTitle>
                      <AlertDialogDescription className="font-medium text-black">
                        Are you sure you want to remove this branch? This action
                        is permanent and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                        onClick={() => [
                          deleteItemHandler(),
                          setIsCreateModalOpen(false),
                        ]}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <div className="grid grid-cols-3 gap-5 max-xl:grid-cols-2 max-sm:flex max-sm:flex-col">
            <div className="flex items-end gap-5">
              <label className="font-medium">Item ID</label>
              <p className="font-light">{selectedItem?.itemId}</p>
            </div>
            <div className="flex items-end gap-5">
              <label className="font-medium">Item Name</label>
              <p className="font-light">{selectedItem?.name}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Category</label>
              <p className="font-light">{selectedItem?.category}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Price</label>
              <p className="font-light">INR {selectedItem?.price}</p>
            </div>
            <div className="col-span-2 flex items-center gap-5">
              <label className="font-medium">GST</label>
              <p className="font-light">{selectedItem?.GST}%</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Unit</label>
              <p className="font-light">{selectedItem?.unit}</p>
            </div>
            <div className="col-span-2 flex items-center gap-5">
              <label className="font-medium">Net Weight</label>
              <p className="font-light">
                {selectedItem?.netWeight}
                {selectedItem?.unit}
              </p>
            </div>

            <div className="items-center gap-5">
              <label className="font-medium">Item Image</label>
              <img
                src={selectedItem?.imageUrl}
                alt="Store Image"
                className="size-30 rounded-md object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
