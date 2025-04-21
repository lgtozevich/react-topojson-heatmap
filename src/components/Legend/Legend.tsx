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
    if (domain.length === 1) return { background: colorScale!(domain[0]) };

    if (scaleType === "continuous" && domain.length > 1) {
      const min = domain[0];
      const max = domain[domain.length - 1];
      const range = max - min;

      const colorStops = domain.map((value) => {
        const percent = ((value - min) / range) * 100;
        return `${colorScale!(value)} ${percent}%`;
      });

      return {
        background: `linear-gradient(to top, ${colorStops.join(", ")})`,
      };
    }
    return {};
  };
  return (
    <div className={`react-topojson-heatmap__legend`}>
      <div className="content-wrapper">
        <div className="legend-header">{children}</div>

        {/* Handles discrete kind of legend */}
        {scaleType === "discrete" && (
          <div className="discrete-legend">
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

        {/* Handles continuous kind of legend */}
        {scaleType === "continuous" && (
          <div className="continuous-legend">
            <div className="legend-gradient-labels">
              <span className="legend-gradient-label">
                {formatter
                  ? formatter(legendValues[legendValues.length - 1])
                  : legendValues[legendValues.length - 1].toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }
                    )}
              </span>
            </div>

            {/* Gradient bar */}
            <div className="legend-gradient" style={gradientStyle()} />

            <div className="legend-gradient-labels">
              <span className="legend-gradient-label">
                {formatter
                  ? formatter(legendValues[0])
                  : legendValues[0].toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
              </span>
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
