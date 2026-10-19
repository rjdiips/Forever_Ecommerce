// Pure geometry for the tee editor. Everything here works in canvas space
// (1000x1000) and is free of DOM access so it can be tested directly.

export const CANVAS_SIZE = 1000;

export const DEFAULT_POSITION = Object.freeze({ x: 500, y: 500 });

// The bounding box of the placed graphic, centred on its position.
export function bounds({ position, scale, graphicSize }) {
  const width = (graphicSize?.width ?? 0) * scale;
  const height = (graphicSize?.height ?? 0) * scale;
  return {
    x: position.x - width / 2,
    y: position.y - height / 2,
    width,
    height,
  };
}

export function hitTest(point, box) {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

// Converts a pointer event (CSS pixels) into canvas space through the
// element's rect. Without this the drag drifts whenever the canvas is scaled.
export function toCanvasPoint(pointer, rect, canvasSize = CANVAS_SIZE) {
  const scaleX = rect.width ? canvasSize / rect.width : 1;
  const scaleY = rect.height ? canvasSize / rect.height : 1;
  return {
    x: (pointer.clientX - rect.left) * scaleX,
    y: (pointer.clientY - rect.top) * scaleY,
  };
}
