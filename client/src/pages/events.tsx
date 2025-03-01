import { useQuery } from "@tanstack/react-query";
import EventCard from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";

export default function Events() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-2">
            No upcoming events at the moment.
          </p>
          <p className="text-gray-500">
            Stay tuned for updates on our upcoming events and gatherings!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  isRecurring: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the events from the static JSON file
    fetch('/data/events.json')
      .then(response => response.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading events:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container py-10 text-center">
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold text-center mb-10">Upcoming Events</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <Calendar className="mr-2 h-4 w-4" />
                {format(new Date(event.date), "MMMM d, yyyy")}
                {event.isRecurring && " (Recurring)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Clock className="mr-2 h-4 w-4" />
                {format(new Date(event.date), "h:mm a")}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="mr-2 h-4 w-4" />
                {event.location}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Add to Calendar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
