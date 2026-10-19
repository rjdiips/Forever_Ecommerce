import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CANVAS_SIZE, bounds, hitTest, toCanvasPoint } from "../tee/geometry";
import { exportTeeBlob } from "../tee/export";

// Draws the draft onto the Tee base's blank. The blank arrives over the network
// (ADR-0005), so the blank's image is kept in a ref and the page is told whether
// it is loading, loaded or failed; nothing is drawn until it is there.
const TshirtCanvas = forwardRef(function TshirtCanvas(
  { design, blankUrl, onMove, onBlankStatus },
  ref
) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Images are held in refs so dragging only repaints; it never reloads the blank.
  const designRef = useRef(design);
  const teeImageRef = useRef(null);
  const graphicImageRef = useRef(null);

  useEffect(() => {
    designRef.current = design;
  }, [design]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const tee = teeImageRef.current;
    if (!tee) return;
    context.drawImage(tee, 0, 0, canvas.width, canvas.height);

    const current = designRef.current;
    const graphic = graphicImageRef.current;
    if (!current.graphic || !current.graphicSize || !graphic) return;

    const box = bounds(current);
    context.drawImage(graphic, box.x, box.y, box.width, box.height);
  }, []);

  useEffect(() => {
    if (!blankUrl) {
      teeImageRef.current = null;
      onBlankStatus?.("unavailable");
      draw();
      return undefined;
    }

    let cancelled = false;
    onBlankStatus?.("loading");
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      teeImageRef.current = image;
      onBlankStatus?.("loaded");
      draw();
    };
    image.onerror = () => {
      if (cancelled) return;
      teeImageRef.current = null;
      onBlankStatus?.("error");
      draw();
    };
    image.src = blankUrl;
    return () => {
      cancelled = true;
      teeImageRef.current = null;
    };
  }, [blankUrl, draw, onBlankStatus]);

  useEffect(() => {
    if (!design.graphic) {
      graphicImageRef.current = null;
      draw();
      return undefined;
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      graphicImageRef.current = image;
      draw();
    };
    image.src = design.graphic;
    return () => {
      graphicImageRef.current = null;
    };
  }, [design.graphic, draw]);

  useEffect(() => {
    draw();
  }, [design.position, design.scale, design.graphicSize, draw]);

  useImperativeHandle(
    ref,
    () => ({ exportBlob: () => exportTeeBlob(canvasRef.current) }),
    []
  );

  const handleMouseDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = toCanvasPoint(event, rect);
    if (!hitTest(point, bounds(design))) return;

    setIsDragging(true);
    dragOffset.current = {
      x: point.x - design.position.x,
      y: point.y - design.position.y,
    };
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = toCanvasPoint(event, rect);
    onMove({
      x: point.x - dragOffset.current.x,
      y: point.y - dragOffset.current.y,
    });
  };

  const stopDragging = () => setIsDragging(false);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="border rounded-lg shadow-lg w-full cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    />
  );
});

export default TshirtCanvas;
