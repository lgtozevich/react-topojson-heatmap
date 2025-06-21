import React from "react";

import type { DataItem } from "src/types";
import "./Tooltip.css";

export type TooltipProps<T> = {
  trigger?: "hover" | "click";
  float?: boolean;
  position?: "top" | "right" | "bottom" | "left";
  tooltipContent?: (meta: DataItem<T>) => React.ReactNode;
};

function Tooltip<T>({}: TooltipProps<T>): null {
  return null;
}

Tooltip.getTooltipProps = <T,>(
  tooltip: React.ReactNode
): TooltipProps<T> | null => {
  if (React.isValidElement(tooltip) && tooltip.type === Tooltip) {
    const props = tooltip.props as TooltipProps<T>;
    return props;
  }
  return null;
};

export default Tooltip;
