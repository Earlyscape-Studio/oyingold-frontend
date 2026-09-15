"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";


export function ProductImageGallery({
    images,
    productName
}: {
    images: string[];
    productName: string;
}) {
    const validImages = images.filter(Boolean);
    const [selectedImage, setSelectedImage] = useState(0);
    
    const activeImage = validImages[selectedImage];

    if (!activeImage) {
      return (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {" "}
          <HugeiconsIcon icon={Image01Icon} size={48} />{" "}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {" "}
        <div className="relative aspect-square w-full rounded-lg bg-muted">
          {" "}
          <Image
            src={activeImage}
            alt={productName}
            fill
            className="object-contain p-8"
            priority
          />{" "}
        </div>{" "}
        {validImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {" "}
            {validImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded-md border-2 bg-muted ${
                  selectedImage === index
                    ? "border-red-600"
                    : "border-transparent"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                {" "}
                <Image
                  src={image}
                  alt={`${productName} image ${index + 1}`}
                  fill
                  className="object-cover"
                />{" "}
              </button>
            ))}{" "}
          </div>
        )}{" "}
      </div>
    );
}