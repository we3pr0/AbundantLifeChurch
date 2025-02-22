import Hero from "@/components/Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InstagramFeed from "@/components/InstagramFeed";
import { Clock, MapPin, Heart } from "lucide-react";

export default function Home() {
  return (
    <div>
      <Hero />
      
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Welcome to Our Community
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Service Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Sunday Service:</strong> 10:00 AM
              </p>
              <p className="mb-2">
                <strong>Youth Service:</strong> Fridays 6:30 PM
              </p>
              <p>
                <strong>Bible Study:</strong> Wednesdays 7:00 PM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">123 Faith Street</p>
              <p className="mb-2">Your City, State 12345</p>
              <p>Free parking available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                To create a welcoming community where everyone can experience God's
                love and discover their purpose.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <InstagramFeed />
      </section>
    </div>
  );
}
