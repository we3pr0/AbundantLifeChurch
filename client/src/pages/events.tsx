import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl?: string;
}

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load events from local JSON file
    fetch('/data/events.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        return response.json();
      })
      .then(data => {
        setEvents(data.events || []);
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
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      {events.length === 0 ? (
        <p className="text-center text-gray-500 my-10">No upcoming events at this time. Check back soon!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {event.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-4 w-4" /> {event.date}
        </CardDescription>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> {event.time}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-500 mb-2">{event.location}</p>
        <p>{event.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">More Details</Button>
      </CardFooter>
    </Card>
  );
}

export default EventsPage;