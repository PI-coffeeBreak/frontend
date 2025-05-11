import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, children, as: Component = "div" }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Component ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </Component>
  );
}