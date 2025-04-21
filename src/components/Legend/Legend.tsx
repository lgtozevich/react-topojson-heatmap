import React from "react";
import "./Legend.css";

export type LegendProps = {
  children?: React.ReactNode | string;
  domain?: number[];
  stepSize?: number;
  scaleType?: "continuous" | "discrete";
  colorScale?: (value: number) => string;
  formatter?: (value: number) => string;
};

function Legend({
  domain = [0, 0],
  children = "Legend",
  stepSize = 5,
  scaleType = "discrete",
  colorScale,
  formatter,
}: LegendProps): JSX.Element {
  const [minValue, maxValue] = [domain[0], domain[domain.length - 1]];
  const numSteps = Math.floor((maxValue - minValue) / stepSize) + 1;
  const legendValues = Array.from(
    { length: numSteps },
    (_, i) => minValue + i * stepSize
  );

  const gradientStyle = () => {
    if (scaleType === "continuous") {
      console.log({
        background: `linear-gradient(to bottom, ${domain
          .map((value) => colorScale!(value))
          .join(", ")})`,
      });
      return {
        background: `linear-gradient(to bottom, ${domain
          .map((value) => colorScale!(value))
          .join(", ")})`,
      };
    }
    return {};
  };
  return (
    <div className={`react-topojson-heatmap__legend`}>
      <div className="content-wrapper">
        <div className="legend-header">{children}</div>
        {scaleType === "discrete" && (
          <div className="legend-body">
            {legendValues.map((value, i) => (
              <div key={i} className="legend-item">
                <div
                  className="legend-color"
                  style={{
                    backgroundColor: colorScale!(value),
                  }}
                />
                <span>
                  {formatter
                    ? formatter(value)
                    : value.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                </span>
              </div>
            ))}
          </div>
        )}
        {scaleType === "continuous" && (
          <div
            className="d-flex legend-body flex-row"
            style={{ height: "100px" }}
          >
            <div className="legend-gradient" style={gradientStyle()} />
            <div className="legend-gradient-labels">
              {legendValues.map((value, i) => (
                <span key={i} className="legend-gradient-label">
                  {formatter
                    ? formatter(value)
                    : value.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Legend.getLegendProps = (legend: React.ReactNode): LegendProps | null => {
  if (React.isValidElement(legend) && legend.type === Legend) {
    const props = legend.props as LegendProps;
    return props;
  }
  return null;
};

export default Legend;
