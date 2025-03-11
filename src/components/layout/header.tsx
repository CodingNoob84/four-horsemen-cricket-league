import Image from "next/image";
import Link from "next/link";
import { UserMenuCard } from "./user-menu";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-20 px-4 mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.jpg"
            alt="IPL Fantasy League"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-2xl font-bold text-red-600 tracking-tight">
              Horsemen
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Cricket League
            </span>
          </div>
        </Link>

        <UserMenuCard />
      </div>
    </header>
  );
};
