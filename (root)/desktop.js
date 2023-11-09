


//blob script adapted from: https://codepen.io/tfrere/pen/wvyeOwe

class ResponsiveBlob {
    constructor(canvas, color, numPoints, margin, x, y, scale) {
      this.canvas = canvas;
      this.color = color;
      this.numPoints = numPoints;
      this.margin = margin;
      this.x = x;
      this.y = y;
      this.scale = scale;
      this.points = [];
      this.oldMousePoint = { x: 0, y: 0 };
      this.hover = true;
      this.size = 1;
      this.sizeTime = 1;
      this.isTurbulenceActive = false;
      this.turbulenceInterval = null;
      this.resize();
      this.createTexture();
  
      for (let i = 0; i < this.numPoints; i++) {
        let point = new Point(this.divisional * i, this);
        this.points.push(point);
      }
  
      window.addEventListener("resize", this.resize.bind(this));
      this.canvas.addEventListener("pointermove", this.mouseMove.bind(this));
    }
  
    resize(e) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.createTexture();
    }
  
    createTexture() {
      const data = Uint32Array.from(
        { length: this.canvas.width * this.canvas.height },
        () => (Math.random() > 0.8 ? 0xff000000 : 0)
      );
      this.img = new ImageData(
        new Uint8ClampedArray(data.buffer),
        this.canvas.width,
        this.canvas.height
      );
    }
  
    mouseMove(e) {
      let pos = this.center;
  
      var rect = this.canvas.getBoundingClientRect();
  
      let clientX = e.clientX - rect.left;
      let clientY = e.clientY - rect.top;
  
      let diff = { x: clientX - pos.x, y: clientY - pos.y };
  
      let dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
      let angle = null;
  
      this.mousePos = { x: pos.x - clientX, y: pos.y - clientY };
  
      if (dist < this.radius && this.hover === false) {
        let vector = { x: clientX - pos.x, y: clientY - pos.y };
        angle = Math.atan2(vector.y, vector.x);
        this.hover = true;
      } else if (dist > this.radius && this.hover === true) {
        let vector = { x: clientX - pos.x, y: clientY - pos.y };
        angle = Math.atan2(vector.y, vector.x);
        this.hover = false;
      }
  
      if (typeof angle == "number") {
        let nearestPoint = null;
        let distanceFromPoint = 100;
  
        this.points.forEach((point) => {
          if (Math.abs(angle - point.azimuth) < distanceFromPoint) {
            nearestPoint = point;
            distanceFromPoint = Math.abs(angle - point.azimuth);
          }
        });
  
        if (nearestPoint) {
          let strength = {
            x: this.oldMousePoint.x - clientX,
            y: this.oldMousePoint.y - clientY,
          };
          strength =
            Math.sqrt(strength.x * strength.x + strength.y * strength.y) * 10;
          if (strength > 100) strength = 100;
          nearestPoint.acceleration = (strength / 100) * (this.hover ? -1 : 1);
        }
      }
  
      this.oldMousePoint.x = clientX;
      this.oldMousePoint.y = clientY;
      this.mousePosition = { x: this.oldMousePoint.x, y: this.oldMousePoint.y };
    }
  
    drawCircle(hasToBeStroke) {
      let ctx = this.canvas.getContext("2d");
      ctx.save();
      ctx.scale(this.scale, this.scale); // Apply scaling
      ctx.translate(this.x, this.y); // Apply translation
  
      ctx.beginPath();
      let position = this.position;
      let pointsArray = this.points;
      let radius = this.radius;
      let points = this.numPoints;
      let divisional = this.divisional;
      let center = this.center;
  
      let lastPoint = pointsArray[points - 2];
      let actualPoint;
      let nextPoint;
      var xc;
      var yc;
  
      actualPoint = pointsArray[points - 2];
      nextPoint = pointsArray[points - 1];
  
      ctx.moveTo(center.x, center.y);
  
      this.drawSegment(
        ctx,
        points,
        pointsArray,
        actualPoint,
        nextPoint,
        lastPoint,
        "green",
        15
      );
  
      actualPoint = pointsArray[points - 1];
      nextPoint = pointsArray[0];
      this.drawSegment(
        ctx,
        points,
        pointsArray,
        actualPoint,
        nextPoint,
        lastPoint,
        "green",
        12
      );
  
      for (let i = 0; i < points; i++) {
        let actualPoint = pointsArray[i];
        let nextPoint = pointsArray[i + 1] || pointsArray[0];
        this.drawSegment(
          ctx,
          points,
          pointsArray,
          actualPoint,
          nextPoint,
          lastPoint,
          "blue",
          2
        );
        lastPoint = actualPoint;
      }
  
      actualPoint = pointsArray[points - 1];
      nextPoint = pointsArray[0];
      this.drawSegment(
        ctx,
        points,
        pointsArray,
        actualPoint,
        { position: { x: center.x, y: center.y } },
        lastPoint,
        "red",
        6
      );
  
      if (hasToBeStroke) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
      }
      ctx.closePath();
  
      ctx.restore(); // Restore scaling and translation
    }
  
    turbulence() {
      if (!this.isTurbulenceActive) {
        this.isTurbulenceActive = true;
        this.turbulenceInterval = setInterval(() => {
          this.points.map((point) => {
            if (Math.random() > 0.5) {
              point.acceleration -= Math.random() * 0.5;
            } else {
              point.acceleration += Math.random() * 0.5;
            }
          });
        }, 100);
      } else {
        this.isTurbulenceActive = false;
        clearInterval(this.turbulenceInterval);
      }
    }
  
    render() {
      let ctx = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      for (let i = 0; i < this.points.length; i++) {
        this.points[i].solveWith(
          this.points[i - 1] || this.points[this.points.length - 1],
          this.points[i + 1] || this.points[0]
        );
      }
  
      ctx.save();
      ctx.scale(this.scale, this.scale); // Apply scaling
      ctx.translate(this.x, this.y); // Apply translation
  
      this.drawCircle(true);
      ctx.globalCompositeOperation = "destination-out";
      this.drawCircle(false);
      ctx.restore();
  
      this.points.map((point) => {
        if (Math.random() > 0.99) {
          point.acceleration = -0.05 + Math.random() * 0.3;
        }
      });
  
      requestAnimationFrame(this.render.bind(this));
    }
  
    drawSegment(
      ctx,
      points,
      pointsArray,
      actualPoint,
      nextPoint,
      lastPoint,
      color,
      size
    ) {
      var xc = (actualPoint.position.x + nextPoint.position.x) / 2;
      var yc = (actualPoint.position.y + nextPoint.position.y) / 2;
  
      ctx.quadraticCurveTo(
        actualPoint.position.x,
        actualPoint.position.y,
        xc,
        yc
      );
  
      lastPoint = actualPoint;
    }
  
    push(item) {
      if (item instanceof Point) {
        this.points.push(item);
      }
    }
  
    set color(value) {
      this._color = value;
    }
    get color() {
      return this._color || "#F38949";
    }
  
    set numPoints(value) {
      if (value > 2) {
        this._points = value;
      }
    }
    get numPoints() {
      return this._points || 36;
    }
  
    get radius() {
      if (this.canvas.clientWidth < this.canvas.clientHeight) {
        return (
          (this.canvas.clientWidth / 1 - this.margin) *
          this.size *
          this.scale
        );
      } else {
        return (
          (this.canvas.clientHeight / 1 - this.margin) *
          this.size *
          this.scale
        );
      }
    }
  
    set position(value) {
      if (typeof value == "object" && value.x && value.y) {
        this._position = value;
      }
    }
  
    get position() {
      return this._position || { x: 0.5, y: 0.5 };
    }
  
    set mousePosition(value) {
      if (typeof value == "object" && value.x && value.y) {
        this._mousePosition = value;
      }
    }
  
    get mousePosition() {
      return this._mousePosition || { x: 0, y: 0 };
    }
  
    get divisional() {
      return (Math.PI * 2) / this.numPoints;
    }
  
    get center() {
      return {
        x: this.canvas.width * this.position.x,
        y: this.canvas.height * this.position.y,
      };
    }
  
    get offset() {
      return { x: this.canvas.offsetWidth, y: this.canvas.offsetHeight };
    }
  
    set running(value) {
      this._running = value === true;
    }
    get running() {
      return this.running !== false;
    }
  }
  
  class Point {
    constructor(azimuth, parent) {
      this.parent = parent;
      this.azimuth = Math.PI - azimuth;
      this._components = {
        x: Math.cos(this.azimuth),
        y: Math.sin(this.azimuth),
      };
      this.acceleration = -0.3 + Math.random() * 0.6;
      window.addEventListener("resize", this.resize.bind(this));
    }
  
    resize(e) {}
  
    solveWith(leftPoint, rightPoint) {
      this.acceleration =
        (-0.3 * this.radialEffect +
          (leftPoint.radialEffect - this.radialEffect) +
          (rightPoint.radialEffect - this.radialEffect)) *
          this.elasticity -
        this.speed * this.friction;
    }
  
    set acceleration(value) {
      if (typeof value == "number") {
        this._acceleration = value;
        this.speed += this._acceleration * 2;
      }
    }
    get acceleration() {
      return this._acceleration || 0;
    }
  
    set speed(value) {
      if (typeof value == "number") {
        this._speed = value;
        this.radialEffect += this._speed * 5;
      }
    }
    get speed() {
      return this._speed || 0;
    }
  
    set radialEffect(value) {
      if (typeof value == "number") {
        this._radialEffect = value;
      }
    }
    get radialEffect() {
      return this._radialEffect || 0;
    }
  
    get position() {
      return {
        x:
          this.parent.center.x +
          this.components.x * (this.parent.radius + this.radialEffect),
        y:
          this.parent.center.y +
          this.components.y * (this.parent.radius + this.radialEffect),
      };
    }
  
    get components() {
      return this._components;
    }
  
    set elasticity(value) {
      if (typeof value === "number") {
        this._elasticity = value;
      }
    }
    get elasticity() {
      return this._elasticity || 0.001;
    }
    set friction(value) {
      if (typeof value === "number") {
        this._friction = value;
      }
    }
    get friction() {
      return this._friction || 0.0085;
    }
  }
  
  // Create a container div to center the canvas on the page
  var container = document.createElement("div");
  container.id = "blob-container";
  container.style.display = "block";
  container.style.position = "relative"; // Set the position to relative
  container.style.width = "100vw"; 
container.style.height = "100vh"; 
  document.body.appendChild(container); // Append the container to the document body
  
  // Function to create responsive canvas
  function createResponsiveBlob(config) {
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = config.x + "px";
    canvas.style.top = config.y + "px";
     // Append the canvas to the container
  
     // Select all canvas elements on the page
var canvasElements = document.querySelectorAll("canvas");

// Set the dimensions for each canvas
var newWidth = 400; // Set the new width
var newHeight = 400; // Set the new height

canvasElements.forEach(function(canvas) {
  canvas.width = newWidth;
  canvas.height = newHeight;
});

     // Calculate maximum dimensions based on container size
     const containerWidth = container.offsetWidth;
     const containerHeight = container.offsetHeight;
     const maxCanvasWidth = containerWidth * config.scale;
     const maxCanvasHeight = containerHeight * config.scale;
   
     canvas.width = Math.min(maxCanvasWidth, containerWidth);
     canvas.height = Math.min(maxCanvasHeight, containerHeight);
   
    
     container.appendChild(canvas);
  
    const responsiveBlob = new ResponsiveBlob(
      canvas,
      config.color,
      config.numPoints,
      config.margin,
      config.x,
      config.y,
      config.scale
    );
    responsiveBlob.render();
  }
  
  // Define an array of blob configurations
  var blobConfigurations = [
    { color: "orange", margin: 0, numPoints: 30, x: 0, y: 200, scale: 0.57,}, //pointsArray: drawObject: "sunflower"},
    { color: "red", margin: 0, numPoints: 30, x: 200, y: 100, scale: 0.57 },
    { color: "blue", margin: 0, numPoints: 30, x: 600, y: 200, scale: 0.47 },
    { color: "green", margin: 0, numPoints: 30, x: 600, y: 300, scale: 0.5 },
    { color: "magenta", margin: 0, numPoints: 30, x: 400, y: 150, scale: 0.5 },
  
  ];
  
  // Create responsive blobs
  for (var i = 0; i < blobConfigurations.length; i++) {
    createResponsiveBlob(blobConfigurations[i]);
  }
  