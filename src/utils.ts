type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type UnionToIntersection<T> = Prettify<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (T extends any ? (x: T) => any : never) extends (x: infer R) => any
    ? R
    : never
>;

export interface PageProps<TParams extends string = never> {
  params: Promise<
    UnionToIntersection<
      {
        [K in TParams]: {
          [F in K extends `...${infer U}` ? U : K]: K extends `...${string}`
            ? string[]
            : string;
        };
      }[TParams]
    >
  >;
}
