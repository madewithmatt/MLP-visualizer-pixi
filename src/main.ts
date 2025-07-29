import { Application, Container, Sprite, Texture, Point, Rectangle } from "pixi.js";
import { initializeGrids, paintAt } from "./PixiComponents/GridContainer";

(async () => {

  const app = new Application();
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xffffff,
    antialias: false
  });
  app.canvas.style.touchAction = "none";
  document.body.appendChild(app.canvas);

  // ================= INITIALIZE GRID PIXEL DATA ================= //
  const { pixelData, spriteMatrix, gridContainer } = initializeGrids();

  // Add gridContainer to stage
  app.stage.addChild(gridContainer);

  // ================= INITIALIZE FORWARD PROP ENGINE ================== //
  

  // ======================= EVENT LISTENERS ========================== //
  // Add event listeners for the grid
  let isDrawing = false;

  gridContainer.on("pointerdown", (e) => {
  isDrawing = true;
  const pos = gridContainer.toLocal(e.global);
  paintAt(pixelData, spriteMatrix, pos);
  });

  gridContainer.on("pointermove", (e) => {
  if (!isDrawing) return;
  const pos = gridContainer.toLocal(e.global);
  paintAt(pixelData, spriteMatrix, pos);
  });

  app.canvas.addEventListener("pointerup", () => {
  isDrawing = false;
  console.log(JSON.stringify(pixelData));
  });

  // Resize when the window is resized
  window.addEventListener("resize", () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });
  
  

})();