import { useEffect, useState } from "react";
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
import { Eye, EyeOff, LoaderCircle, Pencil, Plus, Trash } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createStoreApi, getAllStoresApi } from "@/api/store";
import { toast } from "react-toastify";

export interface StoreInputs {
  id: string;
  storeName: string;
  storeManager: string;
  address: string;
  username: string;
  password: string;
}

export default function StoreList() {
  const [formStatus, setFormStatus] = useState("New");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStoreDetailsModalOpen, setIsStoreDetailsModalOpen] = useState(false);
  const [isStoreNameAvailable, setIsStoreNameAvailable] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [stores, setStores] = useState<StoreInputs[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreInputs>();
  // const [dataToEditDetails, setDataToEditDetails] = useState<StoreInputs>();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreInputs>();

  const onSubmit: SubmitHandler<StoreInputs> = async (data) => {
    setIsloading(true);
    const response = await createStoreApi(data);
    if (response?.status === 200) {
      toast.success("Branch created successfully");
      setIsCreateModalOpen(false);
    } else if (response?.status === 204) {
      setIsStoreNameAvailable(true);
      setTimeout(() => {
        setIsStoreNameAvailable(false);
      }, 3000);
    } else {
      toast.error("Something went wrong");
    }
    setIsloading(false);
  };

  async function getAllStores() {
    const response = await getAllStoresApi();
    if (response?.status === 200) {
      setStores(response.data.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    getAllStores();
  }, []);
  return (
    <section className="w-full">
      <div className="border rounded-2xl p-5">
        <div className="flex justify-between items-center w-full">
          <p className="text-lg font-medium">Stores</p>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger
              className="bg-primary hover:bg-primary flex cursor-pointer items-center gap-2 rounded-2xl p-2 px-4 font-medium text-white"
              onClick={() => [setFormStatus("New"), reset()]}
            >
              <Plus color="white" size={20} />
              Create new
            </DialogTrigger>
            <DialogContent className="min-w-6xl">
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
                  {isStoreNameAvailable && (
                    <p className="mt-1 text-sm text-red-500">
                      Branch Name already exists, please try another one
                    </p>
                  )}
                </div>
                <div className="w-[23%]">
                  <div className="flex w-full flex-col gap-2">
                    <label>Store Manager</label>
                    <input
                      type="text"
                      className="border-primary rounded-md border p-1 py-2 pl-2"
                      {...register("storeManager", {
                        required: true,
                      })}
                    />
                  </div>
                  {errors.storeManager && (
                    <p className="mt-1 text-sm text-red-500">
                      Store Manager name is required
                    </p>
                  )}
                </div>

                <div className="w-[30%]">
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
                <div className="w-[30%]">
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
                <div className="w-full">
                  <div className="flex w-full flex-col gap-2">
                    <label>Address</label>
                    <textarea
                      className="border-primary rounded-md border p-1 py-2 pl-2"
                      {...register("address", { required: true })}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      Address is required
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
        <table className="h-full w-full mt-5">
          <thead>
            <tr className="text-[#797979]">
              <th className="text-start font-medium">
                <div className="flex items-center gap-3">
                  <p>Branch Name</p>
                </div>
              </th>
              <th className="text-start font-medium">
                <div className="flex items-center gap-3">
                  <p>Branch Manager</p>
                </div>
              </th>
              <th className="text-start font-medium">
                <div className="flex items-center gap-3">
                  <p>Total Billing value</p>
                </div>
              </th>
              <th className="text-start font-medium">Username</th>
              <th className="text-end font-medium">Password</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr
                key={store.id}
                className="hover:bg-accent cursor-pointer "
                onClick={() => [
                  setSelectedStore(store),
                  setIsStoreDetailsModalOpen(true),
                ]}
              >
                <td className="text-start font-medium py-2">
                  {store.storeName}
                </td>
                <td className="text-start font-medium">{store.storeManager}</td>
                <td className="text-start font-medium">0</td>
                <td className="text-start font-medium">{store.username}</td>
                <td className="text-end font-medium">{store.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Dialog
          open={isStoreDetailsModalOpen}
          onOpenChange={setIsStoreDetailsModalOpen}
        >
          <DialogTrigger className="hidden"></DialogTrigger>
          <DialogContent className="min-w-6xl">
            <DialogHeader className="flex">
              <div className="flex items-start justify-between pr-10">
                <DialogTitle className="text-2xl">Branch Details</DialogTitle>
                <div className="flex gap-5">
                  <button
                    className="cursor-pointer"
                    onClick={() => [
                      setFormStatus("editing"),
                      setIsStoreDetailsModalOpen(false),
                      // setDataToEditDetails(selectedStore!),
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
                          Are you sure you want to remove this branch? This
                          action is permanent and cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-[#FF4C4C] hover:bg-[#FF4C4C]/50"
                          onClick={() => [
                            //   deleteBranchHandler(),
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
            <div className="grid grid-cols-3 gap-5">
              <div className="flex items-center gap-5">
                <label className="font-medium">Store Name</label>
                <p>{selectedStore?.storeName}</p>
              </div>
              <div className="col-span-2 flex items-center gap-5">
                <label className="font-medium">Store Manager</label>
                <p>{selectedStore?.storeManager}</p>
              </div>

              <div className="col-span-full flex flex-col items-start gap-2">
                <label className="font-medium">Address</label>
                <p>{selectedStore?.address}</p>
              </div>

              <div className="flex items-center gap-5">
                <label className="font-medium">Username</label>
                <p>{selectedStore?.username}</p>
              </div>
              <div className="flex items-center gap-5">
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
                  <button
                    className="cursor-pointer"
                    //   onClick={() => [
                    //     setSelectedBranch(dataToEditDetails!.branchName),
                    //     setIsEditPasswordModalOpen(true),
                    //   ]}
                  >
                    {/* <Pencil size={24} color="#2196F3" /> */}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <label className="font-medium">Total Billing value</label>
                {/* <p>{dataToEditDetails?.bill?.reduce((acc, data) => acc + data.total, 0).toFixed(2)}</p> */}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
