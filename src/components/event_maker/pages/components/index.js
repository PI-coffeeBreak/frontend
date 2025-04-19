import { Title } from "./Title";
import { Image } from "./Image";
import { Button } from "./Button";
import { Text } from "./Text";
import { Alert } from "./Alert";
import { SponsorsComponent } from "./Sponsors";

// Map component names to their implementations
export const Components = {
  Title,
  Image,
  Button,
  Text,
  Alert,
  SponsorsComponent
};

// This is the list of components for UI selection
export const componentList = [
  { name: "Title", title: "Title Component", component: Title },
  { name: "Image", title: "Image Component", component: Image },
  { name: "Button", title: "Button Component", component: Button },
  { name: "Text", title: "Text Component", component: Text },
  { name: "Alert", title: "Alert Component", component: Alert },
  { name: "SponsorsComponent", title: "Sponsors Component", component: SponsorsComponent }
];

// Individual exports for direct usage
export { Title, Text, Button, Alert, Image, SponsorsComponent };
