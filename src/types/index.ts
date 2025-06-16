export type Geography = {
  type?: string;
  properties: {
    [key: string]: any;
  };
  id?: string;
  arcs?: any[];
};

export type DataItem<T = Record<string, string | number>> = T & {
  [key: string]: string | number;
};

export type Data<T = Record<string, string | number>> = {
  [key: string]: DataItem<T>;
};

export type TopoObj = {
  [key: string]: {
    type: "GeometryCollection";
    bbox?: [number, number, number, number];
    geometries: Array<any>;
  };
};
