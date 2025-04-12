import { Button } from "@/components/ui/button";
import { Company } from "@/generated/client";
import prisma from "@/lib/prisma";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { addRecruiter, removeRecruiter } from "@/actions/company";
import { revalidatePath } from "next/cache";

const Page = async () => {
  const userCookie = await getCookie("ykcomtoken", { cookies });
  const user = userCookie ? (JSON.parse(userCookie) as Company) : undefined;

  const recruiters = await prisma.recruiter.findMany({
    where: {
      companyId: user?.companyId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      recruiterId: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">
          Recruiters ({recruiters.length})
        </h1>

        <div className="flex gap-2">
          <Button variant={"outline"} asChild>
            <Link href="./team/bulk-create">Add Bulk Recruiters</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Recruiters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Recruiters</SheetTitle>
                <SheetDescription>
                  Fill in the details of the new recruiter you want to add.
                </SheetDescription>

                <form
                  action={async (formData) => {
                    "use server";
                    const name = formData.get("name") as string;
                    const email = formData.get("email") as string;
                    const password = formData.get("password") as string;
                    const phone = formData.get("phone") as string;
                    const companyId = user?.companyId as string;

                    const { recruiter, error } = await addRecruiter({
                      companyId,
                      name,
                      email,
                      password,
                      phone,
                    });

                    revalidatePath("/company/dashboard/team");
                    console.log(recruiter, error);
                  }}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <SheetClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button type="submit">Add Recruiter</Button>
                  </div>
                </form>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {recruiters.map((recruiter) => (
          <div
            key={recruiter.recruiterId}
            className="flex justify-between items-center p-4 border rounded-md"
          >
            <div>
              <h2 className="text-xl font-semibold">{recruiter.name}</h2>
              <p>{recruiter.email}</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={"ghost"} className="text-red-500">
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove
                    the recruiter from your team.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <form
                    action={async () => {
                      "use server";
                      const { error } = await removeRecruiter(
                        recruiter.recruiterId
                      );

                      if (!error) {
                        revalidatePath("/company/dashboard/team");
                      }
                    }}
                  >
                    <AlertDialogAction type="submit">
                      Delete Permanently
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
