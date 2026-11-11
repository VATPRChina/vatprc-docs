import { useAtom } from "jotai";
import { atomWithStorage, createJSONStorage, unstable_withStorageValidator as withStorageValidator } from "jotai/utils";

const storage = withStorageValidator((value): value is boolean => typeof value === "boolean")(
  createJSONStorage<unknown>(),
);

export const newNavigationAtom = atomWithStorage("vatprc-experimental-new-navigation", false, storage);

export const useNewNavigationFlag = () => useAtom(newNavigationAtom)[0];
