import { Topology } from "topojson-specification";
import { getProperty } from "./reactHandling";

function validateGeometriesHaveId(topology: Topology, idPath: string): boolean {
  for (const key in topology.objects) {
    const collection = topology.objects[key];
    if (collection.type === "GeometryCollection") {
      for (const geometry of collection.geometries) {
        if (
          !getProperty(geometry, idPath) &&
          getProperty(geometry, idPath) !== 0
        ) {
          console.error(
            `Geometry with properties ${JSON.stringify(
              geometry.properties
            )} is missing the "${idPath}" attribute.`
          );
          return false;
        }
      }
    }
  }
  return true;
}

function validateDataKeys(
  topology: Topology,
  data: { [key: string]: any },
  idPath: string,
  valueKey?: string
): boolean {
  for (const key in topology.objects) {
    const collection = topology.objects[key];
    if (collection.type === "GeometryCollection") {
      for (const geometry of collection.geometries) {
        const geoId = getProperty(geometry, idPath);
        if (!geoId && geoId !== 0) {
          console.warn(
            `Invalid geometry ID: "${geoId}" from path "${idPath}". Check your TopoJSON structure.`
          );
          return false;
        }

        if (!(geoId in data)) {
          console.warn(
            `Key "${geoId || "undefined"}" not found in data object.`
          );
          return false;
        }

        if (valueKey && !data[geoId].hasOwnProperty(valueKey)) {
          console.warn(
            `Property "${valueKey}" not found in data entry for key "${geoId}".`
          );
          return false;
        }
      }
    }
  }

  return true;
}

export { validateGeometriesHaveId, validateDataKeys };
