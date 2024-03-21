
//------------------------------------------------------


// General Config

// getting the canvas layers
const firstLayer = document.querySelector('.first-layer');
const ctx1 = firstLayer.getContext('2d');

const secondLayer = document.querySelector('.second-layer');
const ctx2 = secondLayer.getContext('2d');

const thirdLayer = document.querySelector('.third-layer');
const ctx3 = thirdLayer.getContext('2d');

// ajusting the layers to full screen
firstLayer.width = window.innerWidth;
firstLayer.height = window.innerHeight;

secondLayer.width = window.innerWidth;
secondLayer.height = window.innerHeight;

thirdLayer.width = window.innerWidth;
thirdLayer.height = window.innerHeight;

// ajusting the layers when resizing the page
window.addEventListener('resize', () => {

    firstLayer.width = window.innerWidth;
    firstLayer.height = window.innerHeight;
    
    secondLayer.width = window.innerWidth;
    secondLayer.height = window.innerHeight;
    
    thirdLayer.width = window.innerWidth;
    thirdLayer.height = window.innerHeight;


    if (paleteOn) {
        colorPalete ();
    };

    actionsHistory.forEach(action => {
        drawActions(action);
    });

})

// get body html element and change its background here in javascript so i can modify it later
const body = document.querySelector('body');
body.style.backgroundColor = 'white';

// brush color
let brushColor = 'black';

// color palete variables
let paleteSize = 60;
let paleteColumns = 8;
let posX = 0;
let posY = 0;



// ---------------------------------------------------------



// Brush Cursor Config

// object for brush size
const circle = {
    size: 20,
};

// object for mouse movement values
const move = {
    x: undefined,
    y: undefined
};

// adding mouse movement values to the object above
function mouseMovementValues (e) {
    move.x = e.x;
    move.y = e.y;
};

// creating a brush with mouse movement values on x and y
function mouseBrush () {

    ctx1.clearRect(0, 0, firstLayer.width, firstLayer.height);
    ctx1.beginPath();
    ctx1.arc(move.x, move.y, circle.size, 0, 2 * Math.PI);
    ctx1.fillStyle = brushColor;
    ctx1.strokeStyle = brushColor;
    ctx1.fill();
    ctx1.stroke();
    ctx1.closePath();

};



// ---------------------------------------------------------



// Color Palete Config

// position and color config
const colorsArray = ['#FF0000', '#FF5500','#FF9900','#FFcc00','#FFFF00','#FFFF55','#FFFF99','#FFFFcc','#0000FF','#5555FF','#9999FF','#ccccFF','#00FF00','#00FF55','#00FF99','#00FFcc','#FF00FF','#FF55FF','#FF99FF','#FFccFF','#00FFFF','#55FFFF','#99FFFF','#ccFFFF','#FFFFFF','#cccccc','#999999','#555555', '#000000'];

function colorPalete () {

    posX = 0;
    posY = 0;

    colorsArray.forEach((color) => {
        ctx2.beginPath();
        ctx2.fillStyle = color;
        ctx2.fillRect(posX, posY, paleteSize, paleteSize);
        ctx2.closePath();

        posX += paleteSize;
        if(posX >= paleteSize * paleteColumns) {
            posX = 0;
            posY += paleteSize;
        }
    })
};

// change brush color when click on color palete
function brushColorChange(e) {
    const mouseMoveX = e.clientX;
    const mouseMoveY = e.clientY;

    // Check if the mousemove is within the bounds of the color palette
    if (mouseMoveX >= 0 && mouseMoveX <= paleteSize * paleteColumns && mouseMoveY >= 0 && mouseMoveY <= paleteSize * Math.ceil(colorsArray.length / paleteColumns)) {

        // gives me the column position that my mouse is in
        const horizontalIndex = Math.floor(mouseMoveX / paleteSize);

        // gives me the row position that my mouse is in
        const verticalIndex = Math.floor(mouseMoveY / paleteSize)

        // gives me the index number of the colors in the array
        const colorsIndex = verticalIndex * paleteColumns + horizontalIndex;

        // change brush color
        brushColor = colorsArray[colorsIndex]
    };
};


// toggle color palete with spacebar
let paleteOn = false;

function togglePaleteColor () {
    paleteOn = !paleteOn;

    if(paleteOn) {
        
        document.addEventListener('click', brushColorChange);
        colorPalete ();

    } else {
        document.removeEventListener('click', brushColorChange);
        ctx2.clearRect(0, 0, secondLayer.width, secondLayer.height);
    };
};



// ------------------------------------------------------



// Painting config

function start() {
    thirdLayer.classList.add('painting');
    document.addEventListener('mousemove', painting);
};

function pause() {
    thirdLayer.classList.remove('painting');
    document.removeEventListener('mousemove', painting);
};

function painting() {

    ctx3.beginPath();
    ctx3.arc(move.x, move.y, circle.size, 0, 2 * Math.PI);
    ctx3.fillStyle = brushColor;
    ctx3.strokeStyle = brushColor;
    ctx3.fill();
    ctx3.stroke();
    ctx3.closePath();


    // this function is part of the undo last action config
    addAction({
        type: 'painting',
        x: move.x,
        y: move.y,
        circleSize: circle.size,
        brushColor: brushColor
    });

}



// ------------------------------------------------------


// Eraser Config

// erasing variables for toggle functionalities
let toggleEraser = false;
let erasing = false;

// function to select the eraser
function selectEraser () {

    ctx1.clearRect(0, 0, firstLayer.width, firstLayer.height);
    ctx1.beginPath();
    ctx1.arc(move.x, move.y, circle.size, 0, 2 * Math.PI);
    ctx1.fillStyle = 'white';
    ctx1.strokeStyle = 'black';
    ctx1.fill();
    ctx1.stroke();
    ctx1.closePath();

};

// function to activate the eraser
function eraserWorking() {

    ctx3.beginPath();
    ctx3.arc(move.x, move.y, circle.size, 0, 2 * Math.PI);
    ctx3.fillStyle = body.style.backgroundColor;
    ctx3.strokeStyle = body.style.backgroundColor;
    ctx3.fill();
    ctx3.stroke();
    ctx3.closePath();


    // this function is part of the undo last action config
    addAction({
        type: 'eraser',
        x: move.x,
        y: move.y,
        circleSize: circle.size,
        eraserColor: body.style.backgroundColor,
    });
}



// --------------------------------------------------------



// 'Z' Undo Last Action Functionality

// array for storing purposes
let actionsHistory = [];

// function to add circle values to the array above
// this function will be called in the paiting and eraser function
function addAction(action) {
    actionsHistory.push(action)
};



// a function to redraw the painting every time i undo a action
function drawActions(action) {

    if(action.type === 'painting') {

        ctx3.beginPath();
        ctx3.arc(action.x, action.y, action.circleSize, 0, 2 * Math.PI);
        ctx3.fillStyle = action.brushColor;
        ctx3.strokeStyle = action.brushColor;
        ctx3.fill();
        ctx3.stroke();
        ctx3.closePath();

    }

    if(action.type === 'eraser') {

        ctx3.beginPath();
        ctx3.arc(action.x, action.y, action.circleSize, 0, 2 * Math.PI);
        ctx3.fillStyle = action.eraserColor;
        ctx3.strokeStyle = action.eraserColor;
        ctx3.fill();
        ctx3.stroke();
        ctx3.closePath();
    }

};


// this functions is being called on keydown
function undoLastAction () {

    // variable to increase Undo Last Action speed
    const arrayEndNumbersDeleted = 6;

    if (actionsHistory.length > 0) {

        // actionsHistory.pop();

        // instead of using pop() i used splice() to increase the delete speed
        actionsHistory.splice(actionsHistory.length - arrayEndNumbersDeleted);

        ctx3.clearRect(0, 0, thirdLayer.width, thirdLayer.height);
        localStorage.clear();

        // each time i delete something above i redraw the actions but without what was deleted
        actionsHistory.forEach(action => {
            drawActions(action);
        });
    };

};




// --------------------------------------------------------




// Select Previous Brush Size
// this was the most dificult section



// brush size storage area
const getSizes = []; // all values
const storedValues = [20,]; // only the last values

// getting the increased and decreased brush size values and storing them into getSizes
function getAddSizes(sizes) {
    getSizes.push(sizes);
};


// putting the last increased and decreased brush size values into storegedValues
function lastValues() {

    const getLastValue = 1;

    let takenLastValue = getSizes.slice(-getLastValue); // this ensures that i get only the last value

    storedValues.push(...takenLastValue);//... Spread operator to add individual values, because without it i will have arrays inside a array

};


// this function ensures that i get the array length number correctly, because if i try to do this on the global scope it won't work
function getIndex(){
    return storedValues.length - 1;
};


// set indexData to null in the global scope, this will ensure me that its value persists between function calls. and will allow me to decrement the index values
let indexData = null;

function previousBrushSize() {

    // This check ensures that indexData is initialized only once, during the first call to previousBrushSize().
    if (indexData === null) {

        // During the first call to previousBrushSize(), indexData is null, so the function initializes it by assigning it the value returned by the getIndex() function, which represents the initial index.
        
        indexData = getIndex() - 1;// Initialize indexData if not set and decrementing it on the first call
        circle.size = storedValues[indexData];

        
        // making sure the brush does not desappear if indexData becomes a negative number in the first call
        if (indexData < 0) {

            indexData = getIndex() + 1
            circle.size = storedValues[0];

        } else {

            indexData = getIndex() - 1;
            circle.size = storedValues[indexData];
        };

    } else if(indexData > 0) {

        // After the initial call, subsequent calls to previousBrushSize() will decrement indexData by 1 each time.
        indexData -= 1;

        // assigning values to brush size
        circle.size = storedValues[indexData];

    } else if (indexData === 0) {

        indexData = 0; // this will make sure indexData does not go bellow 0

        circle.size = storedValues[indexData]; // setting circle.size to the zero value
    }

    // console.log('New indexData: previous', indexData, storedValues); // Print the new indexData
};


// this is a simplified version from the code above
function nextBrushSize() {

    if (indexData === null) {

        indexData = getIndex(); // i don't need to increment here because i wont start choosing brush size with nextBrushSize()

    } else {

        // increassing indexData
        indexData += 1;

        // assigning values to brush size
        circle.size = storedValues[indexData];

        if (indexData > storedValues.length - 1){
            // making sure that indexData does not go above storedValues.length
            indexData = getIndex();

            circle.size = storedValues[indexData]; // making sure that circle.size gets called when indexData hits zero
        };

    }

    // console.log('Next indexData:', indexData); // Print the new indexData
};



// ------------------------------------------------------




// Save and delete drawings on console storage

function saveDrawingOnConsole(){

    const drawings = thirdLayer.toDataURL();

    localStorage.setItem('canvas-drawings', drawings);
};

function getDrawingsFromConsole(){

    const storedDrawings = localStorage.getItem('canvas-drawings');

    if(storedDrawings){

        let img = new Image();

        img.onload = function () {
            ctx3.drawImage(img, 0, 0);
        };

        img.src = storedDrawings;
    };
};
getDrawingsFromConsole()

function deleteDrawingsFromConsole(){

    // clear localstorge
    localStorage.clear();

    // clear thirdLayer
    ctx3.clearRect(0, 0, thirdLayer.width, thirdLayer.height);


    // get actionsHistory array length
    const deleteArrayStorage = actionsHistory.length;

    // delete drawings storage in actionsHistory
    if (actionsHistory.length > 0) {

        actionsHistory.splice(actionsHistory.length - deleteArrayStorage);
    };
};



// -----------------------------------------------------



// Clean ThirdLayer Completely.
function deleteDrawings() {

    ctx3.clearRect(0, 0, thirdLayer.width, thirdLayer.height);
    localStorage.clear();

    // get actionsHistory array length
    const deleteArrayStorage = actionsHistory.length;

    // delete drawings storage in actionsHistory
    if (actionsHistory.length > 0) {

        actionsHistory.splice(actionsHistory.length - deleteArrayStorage);
    };
};



// -----------------------------------------------------





// Event Listerners Section


// keyboard events

// all the events when keyup
document.addEventListener('keyup', (e) => {
    const key = e.key;

    // this will give me the last increased value on brush size
    if (key === 'w') {
        lastValues()
    };

    // this will give me the last decreased value on brush size
    if (key === 's') {
        lastValues()
    }

    // save drawings on console
    if (key === 'b') {
        saveDrawingOnConsole()
    };

    // delete drawings from console and page
    if (key === 't') {
        deleteDrawingsFromConsole()
    }
});


// all the events when keydown
document.addEventListener('keydown', (e) => {

    const key = e.key;


    // increase or decrease brush size
    if (key === 'w' || key === 'ArrowUp') {

        circle.size += 1;
        mouseBrush()

        // saving increse brush size on getSizes array
        getAddSizes(circle.size);

        // making sure the eraser grows when selected
        if (toggleEraser) {
            selectEraser()
        };

    }
    if (key === 's' || key === 'ArrowDown') {

        circle.size -= 1;
        mouseBrush()

        // saving drecrease brush size on getSizes array
        getAddSizes(circle.size);

        // making sure the eraser shrinks when selected
        if (toggleEraser) {
            selectEraser()
        };

    }
    if (circle.size === 0) {

        circle.size += 1;
        mouseBrush()

        // making sure the eraser doenst change to mouseBrush when it gets to zero size
        if (toggleEraser) {
            selectEraser()
        };

    }


    // selecting the previous and next brush size
    if (key === 'a' || key === 'ArrowLeft') {
        previousBrushSize()
    };
    if (key === 'd' || key === 'ArrowRight') {
        nextBrushSize()
    }


    // toggle color palete
    if (key === ' ') {

        togglePaleteColor();

    };


    // activate eraser and deactivate eraser
    if (key === 'g') {

        toggleEraser = !toggleEraser;
        selectEraser();

    }
    if (!toggleEraser) {

        mouseBrush()
        thirdLayer.classList.remove('erasing');
        erasing = false;
    };


    // delete all drawings, just for development purposes
    if (key === ',') {
        deleteDrawings()
    };


    // undo with 'z'
        if (key === 'z') {
        undoLastAction();
    }

});




// mouse click events
document.addEventListener('click', (e) => {

    // variable to toggle between start and pause
    const isPainting = thirdLayer.classList.contains('painting');

    // variables for mouse click position
    const mouseMoveX = e.clientX;
    const mouseMoveY = e.clientY;

    // making sure that when i click inside the color palete the brush wont start painting
    if (mouseMoveX >= 0 && mouseMoveX <= paleteSize * paleteColumns && mouseMoveY >= 0 && mouseMoveY <= paleteSize * Math.ceil(colorsArray.length / paleteColumns) && paleteOn) {

        pause();

    } else {

        start();
    };
    
    // pausing the painting when not using color palete
    if (isPainting) {
        pause();
    };

    // activating eraser with click
    if (toggleEraser) {

        erasing = !erasing
        
        thirdLayer.classList.add('erasing');

    }
    // removing erase class list
    if (!erasing) {
        thirdLayer.classList.remove('erasing');
    }

});





// mouse moviment events
document.addEventListener('mousemove', (e) => {

    // functions to make the brush follow the mouse
    mouseMovementValues(e);
    mouseBrush();



    // making eraser follow the mouse
    if (toggleEraser) {

        selectEraser();

        // pause painting when eraser selected
        pause();

    };


    // make erasing work
    if (erasing) {

        eraserWorking();
        pause();

    }
    // deactivating erasing
    if (!erasing && thirdLayer.classList.contains('erasing')) {
        selectEraser();
    };


});