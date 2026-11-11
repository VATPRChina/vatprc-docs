import { ActionIcon } from "./primitives";
import useEmblaCarousel from "embla-carousel-react";
import { ComponentProps, ReactNode } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";

export function Carousel({
  children,
  previousControlProps,
  nextControlProps,
}: {
  children?: ReactNode;
  slideSize?: object;
  slideGap?: string;
  controlSize?: number;
  controlsOffset?: number;
  emblaOptions?: object;
  previousControlProps?: ComponentProps<"button">;
  nextControlProps?: ComponentProps<"button">;
  classNames?: object;
  styles?: object;
}) {
  const [ref, api] = useEmblaCarousel({ align: "start" });
  return (
    <div className="relative">
      <div ref={ref} className="overflow-hidden">
        <div className="-ml-2 flex touch-pan-y">{children}</div>
      </div>
      <div className="mt-2 flex justify-end gap-1">
        <ActionIcon {...previousControlProps} variant="light" onClick={() => api?.scrollPrev()}>
          <TbChevronLeft />
        </ActionIcon>
        <ActionIcon {...nextControlProps} variant="light" onClick={() => api?.scrollNext()}>
          <TbChevronRight />
        </ActionIcon>
      </div>
    </div>
  );
}
Carousel.Slide = function CarouselSlide({ children }: { children?: ReactNode }) {
  return <div className="min-w-0 flex-[0_0_100%] pl-2 sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%]">{children}</div>;
};
