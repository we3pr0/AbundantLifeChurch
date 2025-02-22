import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDays className="h-4 w-4" />
          <span>{format(new Date(event.date), "PPP")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
      </CardContent>
    </Card>
  );
}
