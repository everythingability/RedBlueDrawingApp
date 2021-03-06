let socket
let theColor
let theBackgroundColor = "#008cff"
let strokeWidth = 4
let cv, buffer, backgroundBuffer

var w, h
var yDiff = 120
var xDiff = 240
var rSlider, colorPicker
let inp1, inp2

function calculateCanvasSize(){
	h = window.innerHeight * 0.95 //scale it down a bit
	w = h * 1.414
}

function setMidShade() {
  // Finding a shade between the two
//  let commonShade = lerpColor(inp1.color(), inp2.color(), 0.5);
  //fill(commonShade);
//  rect(20, 20, 60, 60);
}
function setPaintColor() {
	changeColor(this.value())
}
function setBgColor() {

	print("bg:"+ this.value() )
	theBackgroundColor = this.value()
	backgroundBuffer.background( theBackgroundColor )
	sendBG(theBackgroundColor)
}


function setup() {
  changeColor('#ff0082')

	calculateCanvasSize()

	buffer = createGraphics(w,h)
	backgroundBuffer = createGraphics(w,h)
	backgroundBuffer.background( theBackgroundColor )



	cv = createCanvas(w + xDiff, h )
	centerCanvas()
	cv.background('lightgray')
	cv.drop(gotFile);

	 inp1 = createColorPicker('#ff0082');
	 inp1.position(80, 40)
	 inp1.input(setPaintColor);

   inp2 = createColorPicker('#008cff');
	 inp2.position(80, 70)
	 inp2.input(setBgColor);


   setMidShade();
	// Start the socket connection
	socket = io.connect('http://localhost:3000')

	// Callback function
	socket.on('mouse', data => {
		buffer.stroke(data.theColor)
		buffer.strokeWeight(data.strokeWidth)
		buffer.line(data.x- xDiff, data.y, data.px- xDiff , data.py)
	})

	socket.on('tool', data => {
		buffer.stroke(data.theColor)
		buffer.strokeWeight(data.strokeWidth)
		buffer.line(data.x- xDiff, data.y, data.px- xDiff , data.py)
	})

	socket.on('bg', data => {
		print("socketBG:" + data.theBackgroundColor)
		backgroundBuffer.background( data.theBackgroundColor )
	})

	rSlider = createSlider(0, 100, 4);
  rSlider.position(80, yDiff);

	 input = createFileInput(gotFile);
   input.position(80, yDiff + 40);


 button = createButton('Download Image');
 button.position(80, yDiff + 100);
 button.mousePressed(download);
}

function download(){
	var outputBuffer = createGraphics(buffer.width, buffer.height)
	//var img = createImage(buffer.width, buffer.height);
	var img = get(xDiff, 0, buffer.width, buffer.height)
	outputBuffer.image(img, 0, 0, buffer.width, buffer.height)

	saveCanvas(outputBuffer,  "redblue", "jpg" )
}

function draw(){
	background('lightgray')
	noStroke()
	fill(theColor)
	strokeWidth= rSlider.value();
	ellipse(160, yDiff -30,strokeWidth,strokeWidth )

   image(backgroundBuffer, xDiff, 0)
   image(buffer, xDiff, 0)
}

function changeColor(c){
	theColor = c
}
function windowResized() {
	centerCanvas()
//	cv.resizeCanvas(windowWidth / 2, windowHeight / 2)
}


function centerCanvas() {
	const x = (windowWidth - width) / 2
	const y = (windowHeight - height) / 2
	cv.position(x, y)
}


function mouseDragged() {
	// Draw
	buffer.stroke(theColor)
	buffer.strokeWeight(strokeWidth)
	buffer.line(mouseX- xDiff, mouseY, pmouseX-xDiff, pmouseY)

	// Send the mouse coordinates
	sendmouse(mouseX, mouseY, pmouseX, pmouseY)
}

function sendBG(c){
	const data = {	theBackgroundColor:c}
	socket.emit('bg', data )
}

// Sending data to the socket
function sendmouse(x, y, pX, pY) {
	const data = {
		x: x,
		y: y,
		px: pX,
		py: pY,
		theColor: theColor,
		strokeWidth: strokeWidth,
	}

	socket.emit('mouse', data)
}






function gotFile(file) {
  print(file)
  raw = new Image();
  raw.src = file.data

  raw.onload = function() {

		var maxWidth = w
          var maxHeight = h
          var width = raw.width
          var height = raw.height

          if(width>height){
            if(width > maxWidth){
              ratio = maxWidth / width;   // get ratio for scaling image
              var newHeight = height * ratio;  // Scale height based on ratio
              var newWidth = width * ratio;    // Reset width to match scaled image
            }
          }else{
            // Check if current height is larger than max
            if(height > maxHeight){
              ratio = maxHeight / height; // get ratio for scaling image
                var newWidth =width * ratio;    // Reset width to match scaled image
              var newHeight =height * ratio;    // Reset height to match scaled image
            }
            //End Do Image
          }

    img = createImage(newWidth, newHeight);

    //blendMode(DARKEST)
		backgroundBuffer.imageMode(CENTER)
    var newY = (h-newHeight)/2
    backgroundBuffer.drawingContext.drawImage(raw, w/2 - newWidth/2, newY, newWidth, newHeight); //what does this do? If I don't do it, stuff doesn't work?
    backgroundBuffer.translate(0, 0)
    //NOTE! Without the following line img doesn't work? But does/can draw to screen...
    img = backgroundBuffer.get() //does this *force* it to be p5.Image... dunno?
    //does drawing to canvas somehow make the img kosher?

    print("eh?")

    print(img, img.width, img.height) //this seems to be a good measure of whether
    //or not the image has loaded...

    drawOnce = true

		removeButton = createButton('Remove Image');
	  removeButton.position(80, yDiff + 70);
	  removeButton.mousePressed(removeBGImage);
  }


}

function removeBGImage(){
	backgroundBuffer.background(theBackgroundColor)
}
