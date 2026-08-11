import type { GalleryCategoryId, GalleryImage } from "@/lib/gallery";
import { ServiceImageCollage } from "@/components/ServiceImageCollage";
import { EditableText } from "@/components/EditableText";

type ServiceCardProps = {
  name: string;
  description: string;
  price: string;
  time: string;
  images: GalleryImage[];
  imageLayout?: "collage" | "strip";
  uploadCategory?: GalleryCategoryId;
  pathPrefix?: string;
};

const SIGNATURE_SERVICES = new Set(["Signature Haircut", "Signature Haircut & Beard"]);

export function ServiceCard({
  name,
  description,
  price,
  time,
  images,
  imageLayout,
  pathPrefix,
}: ServiceCardProps) {
  const layout = imageLayout ?? (SIGNATURE_SERVICES.has(name) ? "strip" : "collage");

  return (
    <article className="group flex flex-col">
      <ServiceImageCollage images={images} layout={layout} />
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
