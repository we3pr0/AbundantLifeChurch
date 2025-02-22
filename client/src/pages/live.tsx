import LiveStream from "@/components/LiveStream";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarDays } from "lucide-react";

export default function Live() {
  // In a real application, this would come from your backend
  const streamInfo = {
    streamId: undefined, // Add your YouTube stream ID here
    isLive: false,
    nextService: "Sunday at 10:00 AM",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">Live Service</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <LiveStream 
            streamId={streamInfo.streamId} 
            isLive={streamInfo.isLive} 
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Service Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>
                  <strong>Sunday Service:</strong>
                  <br />
                  10:00 AM EST
                </li>
                <li>
                  <strong>Wednesday Bible Study:</strong>
                  <br />
                  7:00 PM EST
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Next Live Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{streamInfo.nextService}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
