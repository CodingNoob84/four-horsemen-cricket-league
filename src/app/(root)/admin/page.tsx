"use client";
import { StatCardBlock } from "@/components/admin/stat-cards";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-4 flex flex-col justify-center">
      <StatCardBlock />
      <div className="flex flex-col gap-4">
        <Button asChild>
          <Link href="/admin/matches">Data Entry for All Matches</Link>
        </Button>
        <Button asChild>
          <Link href="/admin/webscraping">Web Scraping</Link>
        </Button>
      </div>
    </div>
  );
}
