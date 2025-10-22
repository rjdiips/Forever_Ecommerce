import React, { useRef, useEffect } from "react";
import { assets } from "../assets/assets";

const TshirtCanvas = ({ tshirtColor, graphic, scale, position }) => {
  const canvasRef = useRef(null);

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

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={1000}
      className="border rounded-lg shadow-lg w-full"
    />
  );
};

export default TshirtCanvas;
