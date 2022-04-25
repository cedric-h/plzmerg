const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

(window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
})();

const art = Object.fromEntries(await Promise.all(
  ["pillars", "windows", "ocean"]
    .map(name => {
      const img = new Image();
      img.src = name + ".png";
      return new Promise(res => img.onload = () => res([name, img]));
    })
));

let input;
window.onkeydown = e => {
  console.log(input);

  if (e.key == "Backspace") {
    if (e.shiftKey)
      input = '';
    else 
      input = input.slice(0, input.length-1),
    e.preventDefault();
  } else if (e.key == "Enter") {
    if (e.shiftKey)
      input += '\n';
    else
      window.location.search = "?input=" + encodeURI(input);
  } else if (e.key.length > 1)
    e.preventDefault();
  else
    input += e.key;
}

let setInput = false;
let render = ({ lines, title }) => (function frame() {
  const writingFor = lines.writingFor;
  if (!setInput) input = lines.input, setInput = true;;

  const now = Date.now(); /* lmfao */
  requestAnimationFrame(frame);

  ctx.save();
  let s = canvas.height/art.pillars.height;
  ctx.scale(s, s);
  const pan = (img, q) => {
    let t = (now/q) % img.width;
    ctx.drawImage(img, t-img.width, 0);
    ctx.drawImage(img, t          , 0);
    ctx.drawImage(img, t+img.width, 0);
  };
  pan(art.  ocean, 300);
  pan(art.windows, 200);
  pan(art.pillars, 100);
  ctx.restore();

  let x = canvas.width/2 - 300;
  let y = canvas.height/2 - 200;
  const text = (l, x, y) => (ctx.fillText(l, x, y), ctx.strokeText(l, x, y));

  if (title) {
    ctx.font = `200px "SFPixelateShadedRegular"`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "navy";
    let c = true, clrz = () => ctx.fillStyle = ["skyblue", "#869ceb"][+(c = !c)];
    let i = 0, oy = () => 9*Math.sin(now/150 + 0.4*i++);
    for (const l of "PLZ") clrz(), text(l, x += 110, y+oy());
    y += 165, x -= 480;
    for (const l of "MERG") clrz(), text(l, x += 150, y+oy());
  } else
    y = 0, x = 200;

  ctx.lineWidth = 1;
  const blue = { strokeStyle: "skyblue", fillStyle: "navy" };
  const green = { strokeStyle: "palegreen", fillStyle: "green" };
  const red = { strokeStyle: "pink", fillStyle: "crimson" };
  Object.assign(ctx, green);
  ctx.font = `40px "SFPixelateShadedRegular"`;

  if (title)
    text("THE collaborATING SIM!", x -= 420, y += 90),
    x -= 100;
  y += 50;

  const renderLines = lines => {
    const colored = [];
    let seg = "";
    let i = 0;
    for (const char of lines) {
      if (char == '\n') {
        if (seg.length) colored.push(seg), seg = "";
        colored.push('\n');
      } else if (char == '"') {
        if (seg.length) colored.push(seg), seg = "";
        if (i++ %2) colored.push('"', green);
        else        colored.push(red,  '"');
      } else if (char == '#') {
        if (seg.length) colored.push(seg), seg = "";
        if (i++ %2) colored.push('"', green);
        else        colored.push(blue,  '"');
      } else if (!seg.length && colored[colored.length-1] == "\n" && char == " ")
        ;
      else
        seg += char;
    }
    colored.push(seg);

    let t = 0;
    for (const chunk of colored) {
      if (chunk == '\n') {
        t = 0;
        y += 40;
      } else if (typeof chunk == "object")
        Object.assign(ctx, chunk);
      else {
        text(chunk, x + t, y);
        t += ctx.measureText(chunk).width;
      }
    }
  };

  x -= 50;
  renderLines(lines.prompt);
  x += 100, y += 90;
  Object.assign(ctx, { "leeza": red, "you": blue }[writingFor] ?? green);
  renderLines("> " + input + ["|", ""][Math.round(now / 1000 % 1)]);
})();
