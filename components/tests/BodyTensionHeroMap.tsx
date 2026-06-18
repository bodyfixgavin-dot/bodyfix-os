"use client";

import Image from "next/image";
import { useState } from "react";

export type BodyTensionMapType = "sedentary" | "stress" | "training" | "pelvic";

type HeroImageConfig = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const bodyTensionHeroImages: Record<BodyTensionMapType, HeroImageConfig> = {
  sedentary: { src: "/images/body-tension/body-tension-sedentary.png", alt: "BodyFix 久坐型身體張力報告圖", width: 864, height: 1536 },
  stress: { src: "/images/body-tension/body-tension-stress.png", alt: "BodyFix 壓力型身體張力報告圖", width: 1120, height: 1408 },
  training: { src: "/images/body-tension/body-tension-training.png", alt: "BodyFix 訓練恢復型身體張力報告圖", width: 1120, height: 1408 },
  pelvic: { src: "/images/body-tension/body-tension-pelvic.png", alt: "BodyFix 骨盆核心代償型身體張力報告圖", width: 1120, height: 1408 },
};

export default function BodyTensionHeroMap({ type }: { type: BodyTensionMapType; secondaryType?: BodyTensionMapType }) {
  const requestedImage = bodyTensionHeroImages[type] ?? bodyTensionHeroImages.sedentary;
  const [image, setImage] = useState(requestedImage);

  return (
    <div className="tension-visual tension-hero-image">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(max-width: 700px) calc(100vw - 72px), 400px"
        onError={() => setImage(bodyTensionHeroImages.sedentary)}
        priority
      />
    </div>
  );
}
