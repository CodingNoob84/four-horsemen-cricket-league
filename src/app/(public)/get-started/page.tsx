import { SignInButton } from "@/components/auth/auth-buttons";
import Link from "next/link";

const GetStartedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-6">
          🏏 Welcome to 4Horsemen Cricket League 🎯
        </h1>
        <p className="text-lg mb-8">
          Think you know cricket? Love the IPL? Prove it! Build your ultimate
          fantasy team and compete for bragging rights.
          <span className="block mt-4 font-semibold">
            No money involved. Just pure fun and strategy! (And maybe a little
            trash talk 😏)
          </span>
        </p>

        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">🤔 How It Works</h2>
          <ul className="list-disc pl-6 text-left text-lg space-y-2">
            <li>
              <strong>Pick Your Team:</strong> Select players based on real IPL
              performances. Choose wisely—bad picks will haunt your dreams! 😱
            </li>
            <li>
              <strong>Compete:</strong> Join leagues, challenge friends, and
              climb the leaderboard. Bragging rights are up for grabs! 🏆
            </li>
            <li>
              <strong>Win Bragging Rights:</strong> Show off your cricket
              expertise—no cash, just glory! (And endless memes if you fail 🤣)
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">🚀 Explore More</h2>
          <p className="text-lg mb-4">
            Learn more about fantasy cricket strategies at the{" "}
            <strong>4 Horsemen Cricket League</strong>. Because knowing the game
            is half the battle—playing it like a genius is the other half! 🧠🏏
          </p>
          <Link
            href="/what-is-4horsemen"
            className="text-blue-600 font-semibold underline"
          >
            Read the Blog 📖
          </Link>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">🔥 Ready to Play?</h2>
          <p className="text-lg mb-4">
            Sign in with Google and start building your dream team today!
            (Warning: Side effects may include cricket addiction 🏏😂)
          </p>
          <SignInButton />
        </div>
      </div>
    </div>
  );
};

export default GetStartedPage;
