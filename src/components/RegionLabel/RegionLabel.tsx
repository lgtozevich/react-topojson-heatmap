import React from "react";

import type { DataItem } from "src/types";
import "./RegionLabel.css";

export type RegionLabelProps<T> = {
  width?: number;
  height?: number;
  regionLabelContent?: (meta: DataItem<T>) => React.ReactNode;
};

function RegionLabel<T>({}: RegionLabelProps<T>): null {
  return null;
}

RegionLabel.getRegionLabelProps = <T,>(
  regionLabel: React.ReactNode
): RegionLabelProps<T> | null => {
  if (React.isValidElement(regionLabel) && regionLabel.type === RegionLabel) {
    const props = regionLabel.props as RegionLabelProps<T>;
    return props;
  }
  return null;
};

export default RegionLabel;
