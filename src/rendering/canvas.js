export const canvas = document.getElementById("c");
export const ctx = canvas.getContext("2d", { alpha: false });

export function resize() {
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

window.addEventListener("resize", resize);
resize();
