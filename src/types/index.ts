export type Geography = {
  type?: string;
  properties: {
    [key: string]: any;
  };
  id?: string;
  arcs?: any[];
};

export type DataItem<T> = T & {
  [key: string]: string | number;
};

export type Data<T> = {
  [key: string]: DataItem<T>;
};

export type TopoObj = {
  [key: string]: {
    type: "GeometryCollection";
    bbox?: [number, number, number, number];
    geometries: Array<any>;
  };
};
