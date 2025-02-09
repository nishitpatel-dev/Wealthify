import { checkUser } from "@/lib/checkUser";
import CheckValidUser from "@/lib/checkValidUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, PenBox } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const Header = async () => {
  await checkUser();

  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={"/"}>{/* <Image /> {Logo Here} */}</Link>
        
        <CheckValidUser />

        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link
              href={"/dashboard"}
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href={"/transaction/create"}>
              <Button>
                <PenBox size={18} className="flex items-center gap-2" />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;
