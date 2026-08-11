import type { GalleryCategoryId, GalleryImage } from "@/lib/gallery";
import { ServiceImageCollage, type GridSlot } from "@/components/ServiceImageCollage";
import { EditableText } from "@/components/EditableText";

type ServiceCardProps = {
  name: string;
  description: string;
  price: string;
  time: string;
  images: GalleryImage[];
  imageLayout?: "collage" | "grid-3x3" | "hero";
  gridSlots?: GridSlot[];
  uploadCategory?: GalleryCategoryId;
  pathPrefix?: string;
};

export function ServiceCard({
  name,
  description,
  price,
  time,
  images,
  imageLayout,
  gridSlots,
  uploadCategory,
  pathPrefix,
}: ServiceCardProps) {
  const isGridService =
    name === "Signature Haircut" || name === "Signature Haircut & Beard";

  const filledGridCount = gridSlots?.filter((slot) => slot.filled).length ?? 0;
  const useGridLayout =
    isGridService &&
    Boolean(gridSlots?.length) &&
    (filledGridCount > 0 || uploadCategory !== undefined);

  const layout =
    imageLayout ?? (useGridLayout ? "grid-3x3" : isGridService ? "hero" : "collage");

  const heroObjectPosition =
    name === "Signature Haircut & Beard" ? "object-[center_65%]" : undefined;

  return (
    <article className="group flex flex-col">
      <ServiceImageCollage
        images={images}
        layout={layout}
        gridSlots={useGridLayout ? gridSlots : undefined}
        uploadCategory={uploadCategory}
        objectPosition={layout === "hero" ? heroObjectPosition : undefined}
      />
      <h3 className="mt-5 font-serif text-xl font-semibold text-charcoal sm:text-2xl">
        {pathPrefix ? (
          <EditableText
            path={`${pathPrefix}.name`}
            defaultValue={name}
            as="span"
            className="font-serif text-xl font-semibold text-charcoal sm:text-2xl"
          />
        ) : (
          name
        )}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/65">
        {pathPrefix ? (
          <EditableText
            path={`${pathPrefix}.description`}
            defaultValue={description}
            as="span"
            className="text-sm leading-relaxed text-charcoal/65"
            multiline
          />
        ) : (
          description
        )}
      </p>
      <p className="mt-3 text-sm font-medium text-brass-dark">
        {pathPrefix ? (
          <>
            <EditableText
              path={`${pathPrefix}.price`}
              defaultValue={price}
              as="span"
              className="text-sm font-medium text-brass-dark"
            />
            {" · "}
            <EditableText
              path={`${pathPrefix}.time`}
              defaultValue={time}
              as="span"
              className="text-sm font-medium text-brass-dark"
            />
          </>
        ) : (
          <>
            {price} · {time}
          </>
        )}
      </p>
    </article>
  );
}
