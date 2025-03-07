import Image from "next/image";
import Link from "next/link";
import { UserMenuCard } from "./user-menu";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-20 px-4 mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/vercel.svg"
            alt="IPL Fantasy League"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-900 ">4</span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-600">Horsemen</span>
              <span className="text-sm font-semibold">Cricket League</span>
            </div>
          </div>
        </Link>
        <UserMenuCard />
      </div>
    </header>
  );
};
