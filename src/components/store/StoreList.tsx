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
import { Button } from "../ui/button";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash,
  Upload,
} from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  createStoreApi,
  deleteStoreApi,
  getAllStoresApi,
  updateStoreApi,
} from "@/api/store";
import { toast } from "react-toastify";
import { uploadImagesApi } from "@/api/admin";
import { getStoreIdApi } from "@/api/settings";

export interface StoreInputs {
  id: string;
  storeId: string;
  storeName: string;
  storeManager: string;
  address: string;
  location: string;
  contactNumber: string;
  image: string;
  username: string;
  password: string;
}

export default function StoreList() {
  const [formStatus, setFormStatus] = useState("New");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStoreDetailsModalOpen, setIsStoreDetailsModalOpen] = useState(false);
  const [isStoreAvailable, setIsStoreNameAvailable] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [stores, setStores] = useState<StoreInputs[]>([]);
  const [filteredItem, setFilteredItem] = useState<StoreInputs[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreInputs | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null | string>(null);
  const [storeId, setStoreId] = useState<string>("");
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StoreInputs>();

  useEffect(() => {
    const delay = setTimeout(() => {
      const text = search.trim().toLowerCase();

      if (!text) {
        setFilteredItem(stores);
        return;
      }

      const filtered = stores.filter((item) => {
        const fieldsToSearch: (string | number | undefined | null)[] = [
          item.storeName,
          item.storeId,
          item.storeManager,
          item.location,
        ];

        return fieldsToSearch.some((field) => {
          if (typeof field === "string") {
            return field.toLowerCase().includes(text);
          }
          if (typeof field === "number") {
            return field.toString().includes(text);
          }
          return false;
        });
      });

      setFilteredItem(filtered);
    }, 300);

    return () => clearTimeout(delay);
  }, [search, stores]);

  const deleteStoreHandler = async () => {
    if (selectedStore?.id) {
      const response = await deleteStoreApi(selectedStore?.id);
      if (response?.status === 200) {
        toast.success("Branch deleted successfully");
        setIsStoreDetailsModalOpen(false);
        getAllStores();
        setSelectedStore(null);
      }
    }
  };

  const setDataToEditDetails = (data: StoreInputs) => {
    setValue("id", data.id);
    setValue("storeId", data.storeId);
    setValue("storeName", data.storeName);
    setValue("storeManager", data.storeManager);
    setValue("address", data.address);
    setValue("location", data.location);
    setValue("contactNumber", data.contactNumber);
    setValue("username", data.username);
    setValue("password", data.password);
    setImage(data.image);
  };

  const onSubmit: SubmitHandler<StoreInputs> = async (data) => {
    setIsloading(true);

    if (formStatus === "New") {
      if (image) {
        const formData = new FormData();
        const img = image as File;
        formData.append("file", img, new Date().getTime() + img.name);
        const response = await uploadImagesApi(formData);
        if (response?.status === 200) {
          data.image = response.data.data[0].url;
          toast.success("Image uploaded successfully");
        }
      } else {
        data.image = "";
      }
      const response = await createStoreApi(data);
      if (response?.status === 200) {
        toast.success("Branch created successfully");
        setIsCreateModalOpen(false);
        getAllStores();
        getStoreId();
        reset();
        setImage(null);
      } else if (response?.status === 204) {
        setIsStoreNameAvailable(true);
        setTimeout(() => {
          setIsStoreNameAvailable(false);
        }, 3000);
      } else {
        toast.error("Something went wrong");
      }
    } else if (formStatus === "editing") {
      if (typeof image === "string") {
        data.image = image;
      } else {
        if (image) {
          const formData = new FormData();
          const img = image as File;
          formData.append("file", img, new Date().getTime() + img.name);
          const response = await uploadImagesApi(formData);
          if (response?.status === 200) {
            data.image = response.data.data[0].url;
            toast.success("Image uploaded successfully");
          }
        } else {
          data.image = "";
        }
      }
      const response = await updateStoreApi(data);
      if (response?.status === 200) {
        toast.success("Branch updated successfully");
        setIsStoreDetailsModalOpen(false);
        setIsCreateModalOpen(false);
        getAllStores();
        setSelectedStore(null);
      }
    }
    setIsloading(false);
  };

  async function getAllStores() {
    const response = await getAllStoresApi();
    if (response?.status === 200) {
      setStores(response.data.data);
      setFilteredItem(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function getStoreId() {
    const response = await getStoreIdApi();
    if (response?.status === 200) {
      setStoreId("shop" + response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    if (storeId) {
      setValue("storeId", storeId);
    }
  }, [storeId, setValue]);

  useEffect(() => {
    getAllStores();
    getStoreId();
  }, []);
  return (
    <section className="w-full">
      <div className="flex w-full gap-5">
        <div className="flex w-[90%] items-center gap-2 rounded-md border px-2">
          <Search className="text-slate-600" size={20} />
          <input
            type="text"
            className="w-full outline-none"
            placeholder="Store"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger
            className="border-primary text-primary flex w-35 cursor-pointer items-center gap-2 rounded-md border p-2 text-sm font-medium"
            onClick={() => [setFormStatus("New"), reset()]}
          >
            Create new
            <Plus size={20} />
          </DialogTrigger>
          <DialogContent className="min-w-6xl max-xl:min-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary">
                {formStatus == "New" ? "Create Store" : "Edit Store"}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <form
              className="flex flex-wrap items-end justify-between gap-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div
                className="flex h-35 w-[15%] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm text-slate-600 max-xl:w-[30%]"
                onClick={() => imageRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={imageRef}
                  onChange={(e) => setImage(e.target.files![0])}
                  accept="image/*"
                />
                {!image && (
                  <>
                    <Upload size={30} />
                    <p>Upload Image</p>
                  </>
                )}
                {image && (
                  <img
                    src={
                      typeof image === "string"
                        ? image
                        : URL.createObjectURL(image)
                    }
                    className="h-full w-full rounded-md"
                    alt="Uploaded preview"
                  />
                )}
              </div>
              <div className="h-fit w-[40%] max-xl:w-[60%]">
                <div className="flex w-full flex-col gap-2">
                  <label>Store ID</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2 pl-2"
                    {...register("storeId", {
                      required: true,
                      minLength: 3,
                    })}
                    disabled
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                  />
                </div>
                {errors.storeId && (
                  <p className="mt-1 text-sm text-red-500">
                    Store Name must be atleast 3 characters
                  </p>
                )}
                {isStoreAvailable && (
                  <p className="mt-1 text-sm text-red-500">
                    Store ID already exists, please try another one
                  </p>
                )}
              </div>
              <div className="w-[40%] max-xl:w-[48%]">
                <div className="flex w-full flex-col gap-2">
                  <label>Store Name</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2 pl-2"
                    {...register("storeName", {
                      required: true,
                      minLength: 3,
                    })}
                  />
                </div>
                {errors.storeName && (
                  <p className="mt-1 text-sm text-red-500">
                    Store Name must be atleast 3 characters
                  </p>
                )}
              </div>
              <div className="w-[30%] max-xl:w-[48%]">
                <div className="flex w-full flex-col gap-2">
                  <label>Store Location</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2 pl-2"
                    {...register("location", {
                      required: true,
                    })}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">
                    Store Location is required
                  </p>
                )}
              </div>

              <div className="w-[30%] max-xl:w-[48%]">
                <div className="flex w-full flex-col gap-2">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2"
                    {...register("storeManager", { required: true })}
                  />
                </div>
                {errors.storeManager && (
                  <p className="mt-1 text-sm text-red-500">
                    Owner Name is required
                  </p>
                )}
              </div>
              <div className="w-[30%] max-xl:w-[48%]">
                <div className="flex w-full flex-col gap-2">
                  <label>Conatct Number</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2"
                    {...register("contactNumber", { required: true })}
                  />
                </div>
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    Contact Number is required
                  </p>
                )}
              </div>
              <div className="w-full">
                <div className="flex w-full flex-col gap-2">
                  <label>Store Address</label>
                  <textarea
                    className="border-primary rounded-md border p-1 py-2"
                    {...register("address", { required: true })}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    Store Address is required
                  </p>
                )}
              </div>
              <div className="w-[49%] max-xl:w-[48%]">
                <div className="flex w-full flex-col gap-2">
                  <label>Username</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2"
                    {...register("username", { required: true })}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    Username is required
                  </p>
                )}
              </div>
              <div className="w-[49%] max-xl:w-[48%]">
                <div className="flex w-full flex-col gap-2">
                  <label>Password</label>
                  <input
                    type="text"
                    className="border-primary rounded-md border p-1 py-2"
                    {...register("password", { required: true })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    Password is required
                  </p>
                )}
              </div>

              <div className="flex w-full justify-end">
                <Button
                  className="bg-primary hover:bg-primary cursor-pointer"
                  type="submit"
                  disabled={isloading}
                >
                  {isloading ? (
                    <LoaderCircle size={24} className="animate-spin" />
                  ) : formStatus === "New" ? (
                    "Create Store"
                  ) : (
                    "Update Store"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <table className="mt-5 w-full">
        <thead>
          <tr className="border text-[#797979]">
            <th className="py-2 text-center font-medium">Store ID</th>
            <th className="text-center font-medium">Store</th>
            <th className="text-center font-medium">Owner Name</th>
            <th className="text-center font-medium">Location</th>
            <th className="text-center font-medium">Username</th>
          </tr>
        </thead>
        <tbody>
          {filteredItem.map((store) => (
            <tr
              key={store.id}
              className="hover:bg-accent cursor-pointer border"
              onClick={() => [
                setSelectedStore(store),
                setIsStoreDetailsModalOpen(true),
              ]}
            >
              <td className="py-2 text-center font-medium">{store.storeId}</td>
              <td className="text-center font-medium">{store.storeName}</td>
              <td className="text-center font-medium">{store.storeManager}</td>
              <td className="text-center font-medium">{store.location}</td>
              <td className="text-center font-medium">{store.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog
        open={isStoreDetailsModalOpen}
        onOpenChange={setIsStoreDetailsModalOpen}
      >
        <DialogTrigger className="hidden"></DialogTrigger>
        <DialogContent className="min-w-6xl max-xl:min-w-2xl">
          <DialogHeader className="flex">
            <div className="flex items-start justify-between pr-10">
              <DialogTitle className="text-primary">
                Store {selectedStore?.storeId + " " + selectedStore?.storeName}
              </DialogTitle>
              <div className="flex gap-5">
                <button
                  className="cursor-pointer"
                  onClick={() => [
                    setFormStatus("editing"),
                    setIsStoreDetailsModalOpen(false),
                    setDataToEditDetails(selectedStore!),
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
                          deleteStoreHandler(),
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
          <div className="grid grid-cols-3 gap-5 max-xl:grid-cols-2">
            <div className="flex items-center gap-5">
              {selectedStore?.image && (
                <img
                  src={selectedStore?.image}
                  alt="Store Image"
                  className="size-30 rounded-md"
                />
              )}
            </div>
            <div className="flex items-end gap-5">
              <label className="font-medium">Store ID</label>
              <p>{selectedStore?.storeId}</p>
            </div>
            <div className="flex items-end gap-5">
              <label className="font-medium">Store Name</label>
              <p>{selectedStore?.storeName}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Store Location</label>
              <p>{selectedStore?.location}</p>
            </div>
            <div className="flex items-center gap-5">
              <label className="font-medium">Owner</label>
              <p>{selectedStore?.storeManager}</p>
            </div>
            <div className="col-span-2 flex items-center gap-5 max-xl:col-span-1">
              <label className="font-medium">Conatct Number</label>
              <p>{selectedStore?.contactNumber}</p>
            </div>

            <div className="flex items-center gap-5">
              <label className="font-medium">Username</label>
              <p>{selectedStore?.username}</p>
            </div>
            <div className="flex items-center gap-5 max-xl:col-span-2">
              <label className="font-medium">Password</label>
              <input
                value={selectedStore?.password}
                type={showPassword ? "text" : "password"}
                className="outline-none"
                disabled
              />
              <div className="flex gap-2">
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={24} className="text-primary" />
                  ) : (
                    <Eye size={24} className="text-primary" />
                  )}
                </button>
              </div>
            </div>
            <div className="col-span-full flex flex-col items-start gap-2">
              <label className="font-medium">Address</label>
              <p>{selectedStore?.address}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
