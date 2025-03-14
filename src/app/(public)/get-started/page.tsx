import { SignInButton } from "@/components/auth/auth-buttons";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";

const GetStartedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">🏏 Welcome to 4HCL! 🎯</h1>
        <p className="text-lg mb-8">
          Think you know cricket? Build your dream IPL team and prove it!
          <span className="block mt-4 font-semibold">
            No money. Just fun, strategy, and ultimate bragging rights! 😏
          </span>
        </p>

        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">🤔 How It Works</h2>
          <ul className="list-disc pl-6 text-left text-lg space-y-2">
            <li>
              <strong>Pick Your Team:</strong> Choose IPL stars & outsmart your
              rivals.
            </li>
            <li>
              <strong>Compete:</strong> Join leagues, top the leaderboard, and
              flex your skills. 🏆
            </li>
            <li>
              <strong>Win Bragging Rights:</strong> No cash, just glory (and
              epic banter 🤣).
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">🔥 Ready to Play?</h2>
          <p className="text-lg mb-4">
            Sign in with Google & start building your squad today! 🚀
          </p>
          <SignInButton />
        </div>

        <Link
          href="/what-is-4horsemen"
          className="text-blue-600 font-semibold underline"
        >
          Learn More 📖
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default GetStartedPage;
