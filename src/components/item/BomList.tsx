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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash,
  Upload,
} from "lucide-react";
import {
  createBomApi,
  deleteBomApi,
  getAllBomsApi,
  getAllItemsApi,
} from "@/api/item";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import type { ItemInputs } from "./ItemList";
import { uploadImagesApi } from "@/api/admin";

export interface ItemSet {
  itemId: string;
  quantity: string;
  name: string;
  Items?: {
    name: string;
    unit: string;
  };
}

interface BOM {
  id: string;
  name: string;
  Items: ItemSet[];
  image: string;
}

export default function BomList({
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
  const [bomName, setBomName] = useState("");
  const [newItem, setNewItem] = useState<ItemSet>({
    itemId: "",
    name: "",
    quantity: "",
  });
  const [newItemList, setNewItemList] = useState<ItemSet[]>([]);
  const [isBomNameAvailable, setIsBomNameAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingItems, setExistingItems] = useState<ItemInputs[]>([]);
  const [bomList, setBomList] = useState<BOM[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null | string>(null);
  const [selectedItem, setSelectedItem] = useState<BOM | null>(null);
  const [isBomDetailsModalOpen, setIsBomDetailsModalOpen] = useState(false);

  const onSubmit = async () => {
    if (!bomName || newItemList.length < 0) {
      toast.warn("Please fill all the fields");
      return;
    }
    setIsLoading(true);
    const data = {
      name: bomName,
      items: newItemList,
      image: "",
    };
    if (image) {
      const formData = new FormData();
      const img = image as File;
      formData.append("file", img, new Date().getTime() + img.name);
      const response = await uploadImagesApi(formData);
      if (response?.status === 200) {
        data.image = response.data.data[0].url;
        toast.success("Image uploaded successfully");
      }
    }

    const response = await createBomApi(data);
    if (response?.status === 200) {
      toast.success("BOM created successfully");
      setIsCreateModalOpen(false);
      setNewItemList([]);
      setBomName("");
      getAllBoms();
      setImage(null);
    } else if (response?.status === 204) {
      setIsBomNameAvailable(true);
      setTimeout(() => {
        setIsBomNameAvailable(false);
      }, 3000);
    } else {
      toast.error("Something went wrong");
    }
    setIsLoading(false);
  };

  const addItemToListHandler = () => {
    if (newItem.itemId === "" || newItem.quantity === "") {
      toast.warn("Please select an item");
      return;
    }
    if (newItemList.find((item) => item.itemId === newItem.itemId)) {
      toast.warn("Item already exists");
      return;
    }
    setNewItemList((prev) => [...prev, newItem]);
    setNewItem({ itemId: "", name: "", quantity: "" });
  };

  const removeItemFromListHandler = (itemId: string) => {
    setNewItemList((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  async function deleteBomHandler() {
    if (selectedItem?.id) {
      const response = await deleteBomApi(selectedItem?.id);
      if (response?.status === 200) {
        toast.success("BOM deleted successfully");
        getAllBoms();
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  async function getAllItems() {
    const response = await getAllItemsApi();
    if (response?.status === 200) {
      setExistingItems(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getAllBoms() {
    const response = await getAllBomsApi();
    if (response?.status === 200) {
      setBomList(response.data.data);
      console.log(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllItems();
    getAllBoms();
  }, []);

  return (
    <>
      <div className="w-full px-20 flex gap-5">
        <div className="border w-full rounded-md flex items-center px-2 gap-2">
          <Search className="text-slate-600" size={20} />
          <input
            type="text"
            className="w-full outline-none "
            placeholder="Search BOMs"
          />
        </div>

        <Button
          className="bg-slate-500 text-white"
          onClick={() =>
            setSections({
              itemList: true,
              bomList: false,
            })
          }
        >
          View Items
        </Button>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger
            className="border-primary text-primary whitespace-nowrap flex border rounded-md p-1 items-center text-sm gap-2 px-2 cursor-pointer"
            onClick={() => [setFormStatus("New")]}
          >
            Create BOM
            <Plus size={18} />
          </DialogTrigger>
          <DialogContent className="min-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {formStatus == "New" ? "Create BOM" : "Edit BOM"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div className="flex flex-wrap justify-between gap-5 items-end">
              <button
                className="w-[25%] text-xs gap-2 text-slate-500 grid rounded-lg border border-dashed border-primary h-40"
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
                    className="w-full h-full rounded-md object-cover"
                    alt="Uploaded preview"
                  />
                )}
              </button>
              <div className="flex w-[70%] flex-col gap-2 ">
                <label>BOM Name</label>
                <input
                  type="text"
                  className="border-primary rounded-md border p-1 py-2 pl-2 "
                  value={bomName}
                  onChange={(e) => setBomName(e.target.value)}
                />
              </div>
              <div className="w-full">
                <label>Select Item</label>
                <div className="flex items-center gap-5">
                  <Select
                    value={newItem.name}
                    onValueChange={(value) => {
                      const selectedItem = existingItems.find(
                        (item) => item.name === value
                      );

                      if (selectedItem) {
                        setNewItem((prev) => ({
                          ...prev,
                          itemId: selectedItem.id,
                          name: selectedItem.name,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {existingItems.map((item) => (
                        <SelectItem value={item.name} key={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex border items-center w-full px-2 rounded-lg border-primary">
                    <input
                      type="text"
                      className="w-full   rounded-md p-1 outline-none"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                    />
                    <p className="text-sm">QTY</p>
                  </div>
                  <Button onClick={() => addItemToListHandler()}>Add</Button>
                </div>
                {isBomNameAvailable && (
                  <p className="mt-1 text-sm text-red-500">
                    BOM Name already exists, please try another one
                  </p>
                )}
              </div>
              {newItemList.length > 0 && (
                <div className="w-full">
                  <label>Item List</label>
                  <table className="w-full">
                    <thead>
                      <tr className="text-[#797979]">
                        <th className="text-start font-medium py-2 border px-2 ">
                          Item Name
                        </th>
                        <th className="text-end font-medium border px-2">
                          Quantity
                        </th>
                        <th className="text-end font-medium border px-2">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {newItemList?.map((item) => (
                        <tr key={item.itemId}>
                          <td className="text-start font-medium py-2 border px-2 ">
                            {item.name}
                          </td>
                          <td className="text-end font-medium border px-2">
                            {item.quantity}
                          </td>
                          <td className="place-items-end font-medium border px-2">
                            <Trash
                              color="red"
                              size={20}
                              className="cursor-pointer"
                              onClick={() =>
                                removeItemFromListHandler(item.itemId)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex w-full justify-end">
                <Button onClick={onSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <LoaderCircle size={24} className="animate-spin" />
                  ) : (
                    "Create BOM"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <section className="w-full px-20 mt-5">
        <table className="w-full">
          <thead>
            <tr className="text-[#797979] border">
              <th className="text-center font-medium py-2  px-2 ">BOM Name</th>
              <th className="text-center font-medium  px-2">Items count</th>
              <th className="text-center font-medium  px-2">Image</th>
              <th className="text-center font-medium  px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {bomList?.map((bom) => (
              <tr
                key={bom.id}
                className="hover:bg-accent cursor-pointer border"
                onClick={() => [
                  setSelectedItem(bom),
                  setIsBomDetailsModalOpen(true),
                ]}
              >
                <td className="text-center  font-medium">{bom.name}</td>
                <td className="text-center font-medium  px-2">
                  {bom.Items?.length}
                </td>
                <td className=" py-1 place-items-center">
                  <img
                    src={bom.image}
                    alt="BOM Image"
                    className="size-15 object-cover rounded-md"
                  />
                </td>
                <td className="place-items-center">
                  <Eye />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Dialog
        open={isBomDetailsModalOpen}
        onOpenChange={setIsBomDetailsModalOpen}
      >
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl">
          <DialogHeader className="flex">
            <div className="flex items-start justify-between pr-10">
              <DialogTitle className="text-primary">
                {selectedItem?.name}
              </DialogTitle>
              <div className="flex gap-5">
                <button
                  className="cursor-pointer"
                  onClick={() => [
                    setFormStatus("editing"),
                    // setIsItemDetailsModalOpen(false),
                    // setDataToEditDetails(selectedItem!),
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
                          deleteBomHandler(),
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
          <table>
            <thead>
              <tr className="text-[#797979] border ">
                <th className="font-medium">Item</th>
                <th className="font-medium">Unit</th>
                <th className="font-medium">QTY</th>
              </tr>
            </thead>
            <tbody>
              {selectedItem?.Items?.map((item) => (
                <tr key={item.itemId} className="border">
                  <td className="text-center">{item.Items?.name}</td>
                  <td className="text-center">{item.Items?.unit}</td>
                  <td className="text-center">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </>
  );
}
