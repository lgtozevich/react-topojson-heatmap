import React, { useId, useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";

import {
  ComposableMap,
  Geographies,
  Geography,
  ProjectionFunction,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { geoMercator, geoCentroid, GeoGeometryObjects } from "d3";
import { scaleLinear } from "d3-scale";
import { feature } from "topojson-client";

import { Topology } from "topojson-specification";
import type {
  Geography as GeographyType,
  Metadata,
  MetaItem,
  TopoObj,
} from "./types";

import {
  getChildByType,
  getProperty,
  getObjectFirstProperty,
} from "./utils/reactHandling";
import {
  validateGeometriesHaveId,
  validateDataKeys,
  validateMetadataKeys,
} from "./utils/errorHandling";
import { centerRect } from "./utils/mathUtils";

import { Tooltip as TT, Legend, RegionLabel } from "./components";

import "./index.css";
import "react-tooltip/dist/react-tooltip.css";

interface TopoHeatmapProps {
  data: Record<string, number>;
  topojson: Topology<TopoObj>;
  idPath?: string;
  metadata?: Metadata;
  children?: React.ReactNode[] | React.ReactNode;
  colorRange?: string[];
  domain?: number[];
  scale?: number;
  translate?: [number, number];
  fitSize?: boolean;
  onClick?: (geo: GeographyType) => void;
  onSelect?: (geos: GeographyType[]) => void;
}

function TopoHeatmap({
  children = [],
  data,
  metadata,
  topojson,
  idPath = "id",
  domain,
  colorRange = ["#90caff", "#2998ff"],
  scale = 1,
  translate = [0, 0],
  fitSize = true,
  onClick,
  onSelect,
}: TopoHeatmapProps): JSX.Element {
  // SVG viewport dimensions.
  const width = 600;
  const height = 600;
  const [projection, setProjection] = useState(() => geoMercator());

  const [selectedGeos, setSelectedGeos] = useState<GeographyType[]>([]);

  const componentId = useId().replace(/:/g, "");
  const maxValue = Math.max(...Object.values(data));
  const colorScale = scaleLinear<string>()
    .domain(domain || [0, maxValue])
    .range(colorRange);

  // Data format error handling
  useEffect(() => {
    validateGeometriesHaveId(topojson, idPath);
    validateDataKeys(topojson, data, idPath);
    if (metadata) validateMetadataKeys(data, metadata);
  }, [topojson]);

  useEffect(() => {
    const geojson = feature(topojson, getObjectFirstProperty(topojson.objects));
    let newProjection = geoMercator();
    if (fitSize)
      newProjection = newProjection.fitSize([width, height], geojson);

    newProjection = newProjection.scale(newProjection.scale() * scale);
    newProjection = newProjection.center([
      newProjection.center()[0] + translate[0],
      newProjection.center()[1] + translate[1],
    ]);
    setProjection(() => newProjection);
  }, [topojson]);

  useEffect(() => {
    if (!onSelect) setSelectedGeos([]);
  }, [onSelect]);

  const tooltipProps = TT.getTooltipProps(getChildByType(children, TT));
  const legendProps = Legend.getLegendProps(getChildByType(children, Legend));
  const regionLabelProps = RegionLabel.getRegionLabelProps(
    getChildByType(children, RegionLabel)
  );

  const getTooltipContent = (geoId: string | number): React.ReactNode => {
    if (tooltipProps && metadata && tooltipProps.tooltipContent) {
      return (
        <div
          className={`react-topojson-heatmap__tooltip ${
            tooltipProps.position || "top"
          }`}
        >
          {tooltipProps.tooltipContent(metadata[geoId])}
        </div>
      );
    } else {
      return (
        <div
          className={`react-topojson-heatmap__tooltip ${
            tooltipProps?.position || "top"
          }`}
        >
          <h3
            style={{
              color: "#ffff",
            }}
          >
            {geoId}
          </h3>
        </div>
      );
    }
  };

  const getRegionLabelContent = (geoId: string | number): React.ReactNode => {
    if (regionLabelProps && metadata && regionLabelProps?.regionLabelContent) {
      return (
        <div className={`react-topojson-heatmap__region-label`}>
          {regionLabelProps.regionLabelContent(metadata[geoId])}
        </div>
      );
    } else {
      return (
        <div className={`react-topojson-heatmap__region-label`}>{geoId}</div>
      );
    }
  };

  const handleSelectGeo = (geo: GeographyType): void => {
    if (!onSelect) return;

    if (!selectedGeos.includes(geo)) {
      onSelect([...selectedGeos, geo]);
      setSelectedGeos((prev) => {
        return [...prev, geo];
      });
    } else {
      onSelect(selectedGeos.filter((curr) => curr !== geo));
      setSelectedGeos(selectedGeos.filter((curr) => curr !== geo));
    }
  };

  return (
    <div className="react-topojson-heatmap">
      {legendProps && (
        <Legend
          domain={legendProps.domain || domain || [0, maxValue]}
          colorScale={legendProps.colorScale || colorScale}
          stepSize={legendProps.stepSize}
          formatter={legendProps.formatter}
        >
          {legendProps.children}
        </Legend>
      )}
      <ComposableMap
        width={width}
        height={height}
        projection={projection as unknown as ProjectionFunction}
      >
        <Geographies geography={topojson} style={{ flexGrow: 1 }}>
          {({ geographies }: { geographies: GeographyType[] }) => (
            <>
              {/**
               * Handle region printing
               */}
              {geographies.map((geo) => {
                const stateValue = data[getProperty(geo, idPath)] || 0;
                return (
                  <Geography
                    key={`${componentId}_${getProperty(geo, idPath)}`}
                    className={`react-topojson-heatmap__state ${
                      selectedGeos.includes(geo) ? "selected" : ""
                    }`}
                    geography={geo}
                    fill={colorScale(stateValue)}
                    id={`geo-${componentId}-${getProperty(geo, idPath)}`}
                    data-tooltip-id={`tooltip-${componentId}`}
                    data-tooltip-html={ReactDOMServer.renderToStaticMarkup(
                      getTooltipContent(getProperty(geo, idPath))
                    )}
                    data-region-label-id={`region-label-${componentId}`}
                    data-region-label-html={ReactDOMServer.renderToStaticMarkup(
                      getRegionLabelContent(getProperty(geo, idPath))
                    )}
                    onClick={() => {
                      if (onClick) onClick(geo);
                      handleSelectGeo(geo);
                    }}
                  />
                );
              })}
              {/**
               * Handle region labels printing
               */}
              {regionLabelProps &&
                geographies.map((geo) => {
                  const width = regionLabelProps?.width ?? 75;
                  const height = regionLabelProps?.height ?? 50;
                  const [x, y] = centerRect(
                    projection(geoCentroid(geo as GeoGeometryObjects)) || [
                      0, 0,
                    ],
                    width,
                    height
                  );
                  return (
                    <foreignObject
                      key={`${componentId}_label_${getProperty(geo, idPath)}`}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                    >
                      {getRegionLabelContent(getProperty(geo, idPath))}
                    </foreignObject>
                  );
                })}
            </>
          )}
        </Geographies>
      </ComposableMap>
      <Tooltip
        id={`tooltip-${componentId}`}
        hidden={!!!tooltipProps}
        openOnClick={tooltipProps?.trigger === "click"}
        float={tooltipProps?.float || false}
        place={tooltipProps?.position || "top"}
        border="none"
        style={{
          padding: 0,
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}

export default TopoHeatmap;
export type { GeographyType, Metadata, MetaItem, Topology };
export { Legend, Tooltip, RegionLabel } from "./components";
