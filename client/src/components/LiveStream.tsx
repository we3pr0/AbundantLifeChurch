import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface LiveStreamProps {
  streamId?: string;
  isLive?: boolean;
}

export default function LiveStream({ streamId, isLive = false }: LiveStreamProps) {
  if (!streamId) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <p>No live stream is currently available.</p>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Please check back during our scheduled service times.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${streamId}?autoplay=1&rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
