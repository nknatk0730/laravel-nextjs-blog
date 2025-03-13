export const Footer = ({
  className,
}: {
  className: string;
}) => {
  return (
    <div className={className}>
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <p className="text-center">© 2021 Laravel Next.js Blog App</p>
        </div>
      </footer>
    </div>
  );
}