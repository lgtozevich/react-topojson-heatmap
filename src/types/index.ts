export type Geography = {
  type?: string;
  properties: {
    [key: string]: any;
  };
  id?: string;
  arcs?: any[];
};

export type DataItem = {
  [key: string]: string | number;
};

export type Data = {
  [key: string]: DataItem;
};

export type TopoObj = {
  [key: string]: {
    type: "GeometryCollection";
    bbox?: [number, number, number, number];
    geometries: Array<any>;
  };
};
