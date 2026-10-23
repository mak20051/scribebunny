export type VideoPackageId = "single" | "five" | "ten";

export type VideoPackage = {
  id: VideoPackageId;
  name: string;
  videos: number;
  priceCents: number;
  turnaround?: string;
  featured?: boolean;
};

export const videoPackages: VideoPackage[] = [
  {
    id: "single",
    name: "1 Video",
    videos: 1,
    priceCents: 29900,
    turnaround: "Delivered in 24 to 48 hours",
  },
  {
    id: "five",
    name: "5 Videos",
    videos: 5,
    priceCents: 119900,
    featured: true,
  },
  {
    id: "ten",
    name: "10 Videos",
    videos: 10,
    priceCents: 219900,
  },
];

const singleVideoCents = videoPackages[0].priceCents;

export function findVideoPackage(id: unknown) {
  return videoPackages.find((videoPackage) => videoPackage.id === id);
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function perVideoCents(videoPackage: VideoPackage) {
  return Math.round(videoPackage.priceCents / videoPackage.videos);
}

export function savingsCents(videoPackage: VideoPackage) {
  return videoPackage.videos * singleVideoCents - videoPackage.priceCents;
}
