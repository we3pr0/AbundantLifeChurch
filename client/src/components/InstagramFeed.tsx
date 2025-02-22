import { Card, CardContent } from "@/components/ui/card";
import { Instagram } from "lucide-react";

export default function InstagramFeed() {
  return (
    <div className="rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Instagram className="h-6 w-6" />
          Follow Us on Instagram
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-white">
        {/* Instagram feed would be integrated here */}
        <Card className="aspect-square">
          <CardContent className="p-0">
            <img
              src="https://images.unsplash.com/photo-1528828085966-aff4e01c5f2b"
              alt="Worship service"
              className="w-full h-full object-cover"
            />
          </CardContent>
        </Card>
        <Card className="aspect-square">
          <CardContent className="p-0">
            <img
              src="https://images.unsplash.com/photo-1529070538774-1843cb3265df"
              alt="Community gathering"
              className="w-full h-full object-cover"
            />
          </CardContent>
        </Card>
        <Card className="aspect-square">
          <CardContent className="p-0">
            <img
              src="https://images.unsplash.com/photo-1528605248644-14dd04022da1"
              alt="Church event"
              className="w-full h-full object-cover"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
