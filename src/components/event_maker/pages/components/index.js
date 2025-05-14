import { Title } from "./Title";
import { Image } from "./Image";
import { Button } from "./Button";
import { Text } from "./Text";
import { Alert } from "./Alert";
import { Location } from "./Location";
import { SponsorsComponent } from "./Sponsors";
import { FeedbackFormComponent } from "./FeedbackForm";
import { FloorPlanComponent } from "./FloorPlan";

// Map component names to their implementations
export const Components = {
  Title,
  Image,
  Button,
  Text,
  Alert,
  SponsorsComponent,
  FeedbackFormComponent,
  FloorPlanComponent,
};

// This is the list of components for UI selection
export const componentList = [
  { name: "Title", title: "Title Component", component: Title },
  { name: "Image", title: "Image Component", component: Image },
  { name: "Button", title: "Button Component", component: Button },
  { name: "Text", title: "Text Component", component: Text },
  { name: "Alert", title: "Alert Component", component: Alert },
  { name: "Location", title: "Location Component", component: Location },
  { name: "SponsorsComponent", title: "Sponsors Component", component: SponsorsComponent },
  {name: "FeedbackForm", title: "Feedback Form", component: FeedbackFormComponent },
  { name: "FloorPlanComponent", title: "Floor Plan Component", component: FloorPlanComponent },
];

export { Title, Text, Button, Alert, Image, Location, SponsorsComponent, FeedbackFormComponent, FloorPlanComponent };
