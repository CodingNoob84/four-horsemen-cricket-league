import FourHorsemenBlog from "@/components/common/blog";
import { Footer } from "@/components/layout/footer";

export default function BlogPage() {
  return (
    <div className="flex flex-col">
      <FourHorsemenBlog />
      <Footer />
    </div>
  );
}
