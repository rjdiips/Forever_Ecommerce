import React, { useRef, useEffect, useState } from "react";
import { assets } from "../assets/assets";

const TshirtCanvas = ({
  tshirtColor,
  graphic,
  scale,
  position,
  setPosition,
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const graphicDimensions = useRef({ width: 0, height: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const tshirtImg = new Image();
    tshirtImg.crossOrigin = "anonymous";
    tshirtImg.src =
      tshirtColor === "white" ? assets.tshirt_white : assets.tshirt_black;

    tshirtImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tshirtImg, 0, 0, canvas.width, canvas.height);

      if (graphic) {
        const graphicImg = new Image();
        graphicImg.crossOrigin = "anonymous";
        graphicImg.src = graphic;
        graphicImg.onload = () => {
          graphicDimensions.current = {
            width: graphicImg.width,
            height: graphicImg.height,
          };
          const scaledWidth = graphicImg.width * scale;
          const scaledHeight = graphicImg.height * scale;
          ctx.drawImage(
            graphicImg,
            position.x - scaledWidth / 2,
            position.y - scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );
        };
      }
    };
  }, [tshirtColor, graphic, scale, position]);

  const handleMouseDown = (e) => {
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    const scaledWidth = graphicDimensions.current.width * scale;
    const scaledHeight = graphicDimensions.current.height * scale;
    const graphicX = position.x - scaledWidth / 2;
    const graphicY = position.y - scaledHeight / 2;

    if (
      mouseX >= graphicX &&
      mouseX <= graphicX + scaledWidth &&
      mouseY >= graphicY &&
      mouseY <= graphicY + scaledHeight
    ) {
      setIsDragging(true);

      dragOffset.current = {
        x: mouseX - position.x,
        y: mouseY - position.y,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;

    setPosition({
      x: mouseX - dragOffset.current.x,
      y: mouseY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={1000}
      className="border rounded-lg shadow-lg w-full cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default TshirtCanvas;
