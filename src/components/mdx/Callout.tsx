export function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "success";
  children: React.ReactNode;
}) {
  const colors = {
    info: "bg-blue-50 border-blue-300 text-blue-900",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-900",
    success: "bg-green-50 border-green-300 text-green-900",
  };

  return (
    <div
      className={`border-l-4 p-4 my-6 rounded ${colors[type]}`}
    >
      {children}
    </div>
  );
}