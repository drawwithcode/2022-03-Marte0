let handsfree;

let capture;

let mugPos = { x: 0, y: 0 };

let fingertips = [8, 12, 16, 20];

let poseNet;
let pose;

let mug;

let mugSize;

function preload() {
  mug = loadImage("assets/cup.png");
  drink = song = loadSound("assets/drink.mp3");
}

function setup() {
  handsfree = new Handsfree({
    //showDebug: true,
    faceMesh: true,
    hands: true,
    maxNumHands: 1,
  });
  handsfree.start();
  handsfree.enablePlugins("browser");
  handsfree.plugin.pinchScroll.disable();

  capture = createCapture(VIDEO);

  createCanvas(windowWidth, windowHeight);

  capture.hide();
  capture.size(width, height);

  poseNet = ml5.poseNet(capture);
  poseNet.on("pose", getPoses);

  mugSize = map(1, 0, 1920, 0, width);
  mug.resize(mugSize * 300, mugSize * 300);
  mugPos = { x: windowWidth / 1.5, y: windowHeight - mug.height / 2 };
}

function draw() {
  background(255);

  push();
  scale(-1, 1), 1;
  translate(-width, 0);
  image(capture, 0, 0, width, height);
  pop();

  push();

  image(mug, mugPos.x - mug.width + 50 * mugSize, mugPos.y - mug.height / 2);
  pop();

  if (handsfree.data.hands) {
    // let right = handsfree.data.hands.landmarksVisible[1];
    // let rightPoints = handsfree.data.hands.landmarks[1];

    // noStroke();
    // if (right) {
    //   for (let i = 0; i < rightPoints.length; i++) {
    //     i % 4 ? fill(150, 150, 150, 150) : fill(0, 255, 255, 150);
    //     circle(width - width * rightPoints[i].x, height * rightPoints[i].y, 20);
    //   }
    // }

    movemug();
  }
}

function movemug() {
  const hands = handsfree.data?.hands;

  if (hands?.pinchState) {
    hands.pinchState[1].forEach((state, finger) => {
      let fingerX = width - hands.landmarks?.[1]?.[(finger + 2) * 4]?.x * width;
      let fingerY = hands.landmarks?.[1]?.[(finger + 2) * 4]?.y * height;

      if (
        state == "held" &&
        dist(mugPos.x, mugPos.y, fingerX, fingerY) < 300 * mugSize
      ) {
        //console.log(finger);

        //console.log(hands);

        mugPos.x = fingerX;
        mugPos.y = fingerY;

        if (
          pose &&
          !drink.isPlaying() &&
          dist(
            mugPos.x - mug.width / 2,
            mugPos.y - mug.height / 2,
            width - pose.nose.x,
            pose.nose.y
          ) < 100
        ) {
          console.log("bevo");
          drink.play();
        }

        // if (pose) {
        //   fill("blue");
        //   circle(mugPos.x - mug.width / 2, mugPos.y - mug.height / 2, 30);

        //   fill("green");
        //   circle(width - pose.nose.x, pose.nose.y + 10, 30);
        // }
      }
    });
  }
}

function getPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
  }
}
