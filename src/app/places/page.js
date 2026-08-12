import { getPlaces } from "../actions";
import PlacesClient from "@/components/PlacesClient";

export default async function PlacesPage() {
  const places = await getPlaces();

  return (
    <div className="flex flex-col min-h-full w-full">
      <PlacesClient places={places} />
    </div>
  );
}
