import React from "react";

import type { DataItem } from "src/types";
import "./RegionLabel.css";

export type RegionLabelProps<T = Record<string, string | number>> = {
  width?: number;
  height?: number;
  regionLabelContent?: (meta: DataItem<T>) => React.ReactNode;
};

function RegionLabel<
  T = Record<string, string | number>
>({}: RegionLabelProps<T>): null {
  return null;
}

RegionLabel.getRegionLabelProps = <T = Record<string, string | number>,>(
  regionLabel: React.ReactNode
): RegionLabelProps<T> | null => {
  if (React.isValidElement(regionLabel) && regionLabel.type === RegionLabel) {
    const props = regionLabel.props as RegionLabelProps<T>;
    return props;
  }
  return null;
};

export default RegionLabel;
