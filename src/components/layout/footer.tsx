export const Footer = () => {
  return (
    <footer className="mt-10 py-4 text-center text-sm text-muted-foreground">
      <div className="flex flex-col items-center gap-2">
        <div>
          © 2024 <span className="font-bold">4 Horsemen Cricket League</span>.
          All rights reserved.
        </div>
        <div>
          Not affiliated with the official Indian Premier League or BCCI.
        </div>
        <div className="flex flex-row gap-2">
          <div>Made with</div>
          <div className="inline-block text-red-500 animate-bounce">❤️</div>
          <div>
            by{" "}
            <span className="font-bold">
              K<span className="text-red-500">ART</span>HIK
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
