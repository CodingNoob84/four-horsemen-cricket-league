import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-4 flex flex-col justify-center">
      <Button asChild>
        <Link href="/admin/matches">Data Entry for All Matches</Link>
      </Button>
    </div>
  );
}
