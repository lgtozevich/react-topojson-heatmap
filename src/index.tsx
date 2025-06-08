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
  Data,
  DataItem,
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
} from "./utils/errorHandling";
import { centerRect } from "./utils/mathUtils";

import { Tooltip as TT, Legend, RegionLabel } from "./components";

import "./index.css";
import "react-tooltip/dist/react-tooltip.css";

interface TopoHeatmapProps {
  data: Data;
  topojson: Topology<TopoObj>;
  valueKey: string;
  idPath?: string;
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
  valueKey,
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

  // Extract values using valueKey
  const extractValue = (item: DataItem): number => {
    if (!item || !valueKey || typeof item[valueKey] === "undefined") return 0;
    const value = item[valueKey];
    return typeof value === "number" ? value : 0;
  };

  const dataValues = Object.keys(data).map((key) => extractValue(data[key]));
  const maxValue = Math.max(...dataValues);
  const colorScale = scaleLinear<string>()
    .domain(domain || [0, maxValue])
    .range(colorRange);

  // Data format error handling
  useEffect(() => {
    validateGeometriesHaveId(topojson, idPath);
    validateDataKeys(topojson, data, idPath, valueKey);
  }, [topojson, data, idPath, valueKey]);

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
    if (tooltipProps && data[geoId] && tooltipProps.tooltipContent) {
      return (
        <div
          className={`react-topojson-heatmap__tooltip ${
            tooltipProps.position || "top"
          }`}
        >
          {tooltipProps.tooltipContent(data[geoId])}
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
    if (
      regionLabelProps &&
      data[geoId] &&
      regionLabelProps?.regionLabelContent
    ) {
      return (
        <div className={`react-topojson-heatmap__region-label`}>
          {regionLabelProps.regionLabelContent(data[geoId])}
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
          scaleType={legendProps.scaleType}
          stepSize={legendProps.stepSize}
          minValueLabel={legendProps.minValueLabel}
          maxValueLabel={legendProps.maxValueLabel}
          height={legendProps.height}
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
                const geoId = getProperty(geo, idPath);
                const geoData = data[geoId] || {};
                const stateValue = extractValue(geoData);
                return (
                  <Geography
                    key={`${componentId}_${geoId}`}
                    className={`react-topojson-heatmap__state ${
                      selectedGeos.includes(geo) ? "selected" : ""
                    }`}
                    geography={geo}
                    fill={colorScale(stateValue)}
                    id={`geo-${componentId}-${geoId}`}
                    data-tooltip-id={`tooltip-${componentId}`}
                    data-tooltip-html={ReactDOMServer.renderToStaticMarkup(
                      getTooltipContent(geoId)
                    )}
                    data-region-label-id={`region-label-${componentId}`}
                    data-region-label-html={ReactDOMServer.renderToStaticMarkup(
                      getRegionLabelContent(geoId)
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
                      /* Handle label superposition */
                      onMouseEnter={(e) => {
                        const node = e.currentTarget;
                        const parent = node.parentNode;
                        if (parent) {
                          parent.appendChild(node);
                        }
                      }}
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
export type { GeographyType, Data, DataItem, Topology };
export { Legend, Tooltip, RegionLabel } from "./components";
