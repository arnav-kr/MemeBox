export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="container mx-auto px-6 py-4 md:px-10 lg:px-16">
        <div className="flex flex-col items-center space-y-1 text-center">
          <p className="text-sm text-neutral-400">
            © 2025 Meme Box. All rights reserved.
          </p>
          <p className="text-sm text-neutral-300">
            Made with ❤️ by{" "}
            <a
              href="https://github.com/arnav-kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 underline decoration-neutral-600 transition-colors duration-200 hover:text-neutral-100 hover:decoration-neutral-300"
            >
              Arnav
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
