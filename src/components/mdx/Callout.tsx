import React from "react";

type CalloutType = "info" | "warning" | "success";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const styles = {
  info: {
    wrapper: "bg-blue-50 border-blue-300 text-blue-900",
    defaultTitle: "💡 Did you know?",
  },
  warning: {
    wrapper: "bg-yellow-50 border-yellow-300 text-yellow-900",
    defaultTitle: "Warning",
  },
  success: {
    wrapper: "bg-green-50 border-green-300 text-green-900",
    defaultTitle: "Good to know",
  },
};

export function Callout({
  type = "info",
  title,
  children,
}: CalloutProps) {
  const config = styles[type];

  return (
    <div className={`border-l-4 p-4 my-6 rounded ${config.wrapper}`}>
      <div className="flex items-center gap-2 mb-2 font-semibold">
        <h4 className="text-sm font-bold leading-none">{title ?? config.defaultTitle}</h4>
      </div>

      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
