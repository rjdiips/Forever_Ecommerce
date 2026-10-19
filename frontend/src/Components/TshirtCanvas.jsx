import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { CANVAS_SIZE, bounds, hitTest, toCanvasPoint } from "../tee/geometry";
import { exportTeeBlob } from "../tee/export";

const TshirtCanvas = forwardRef(function TshirtCanvas({ design, onMove }, ref) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Images are held in refs so dragging only repaints; it never reloads assets.
  const designRef = useRef(design);
  const teeImageRef = useRef(null);
  const graphicImageRef = useRef(null);

  const teeSrc = design.color === "white" ? assets.tshirt_white : assets.tshirt_black;

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
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      teeImageRef.current = image;
      draw();
    };
    image.src = teeSrc;
    return () => {
      teeImageRef.current = null;
    };
  }, [teeSrc, draw]);

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
