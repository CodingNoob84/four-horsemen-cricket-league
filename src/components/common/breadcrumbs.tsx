"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Badge } from "../ui/badge";

export const Breadcrumbs = ({
  title,
  isAdmin,
  backLink,
}: {
  title: string;
  isAdmin: boolean;
  backLink: string;
}) => {
  //const pathname = usePathname();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Link href={backLink} className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      {isAdmin && (
        <Badge className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 flex items-center">
          <Shield className="w-4 h-4 mr-1" />
          Admin
        </Badge>
      )}
    </div>
  );
};
