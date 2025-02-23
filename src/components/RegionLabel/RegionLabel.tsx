import React from "react";

import type { MetaItem } from "src/types";
import "./RegionLabel.css";

export type RegionLabelProps = {
  position?: "top" | "right" | "bottom" | "left" | "center";
  regionLabelContent?: (meta: MetaItem) => React.ReactNode;
};

function RegionLabel({}: RegionLabelProps): null {
  return null;
}

RegionLabel.getRegionLabelProps = (
  regionLabel: React.ReactNode
): RegionLabelProps | null => {
  if (React.isValidElement(regionLabel) && regionLabel.type === RegionLabel) {
    const props = regionLabel.props as RegionLabelProps;
    return props;
  }
  return null;
};

export default RegionLabel;
