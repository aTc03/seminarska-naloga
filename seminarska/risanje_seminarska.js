// Referenca za canvas element
let canvas;
// Kontekst ponuja funkcije, ki se uporabljajo za risanje in
// delo s Canvasom
let ctx;
// Shrani predhodno narisane slikovne podatke za obnovitev
// dodane so nove risbe
let savedImageData;
// Shrani, ali trenutno vlečem miško
let dragging = false;
let strokeColor = 'black';
let fillColor = 'black';
let line_Width = 2;
let polygonSides = 6;
// Orodje, ki se trenutno uporablja
let currentTool = 'brush';
let canvasWidth = 600;
let canvasHeight = 600;
 
// Shrani, ali trenutno uporabljam čopič
let usingBrush = false;
// Shrani vrstice x & ys, ki se uporabljajo za izdelavo črt čopiča
let brushXPoints = new Array();
let brushYPoints = new Array();
// Shrani, ali je miška pritisnjena
let brushDownPos = new Array();
// Shrani barvo vsake točke
let brushColorPoints = new Array();

 
// Shrani podatke o velikosti, ki se uporabljajo za ustvarjanje oblik 
// ki se bodo znova narisale, ko bo uporabnik premaknil miško
class ShapeBoundingBox{
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
}
 
// Drži položaj x in y, kjer je miška kliknjena
class MouseDownPos{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
 
// Zadržuje x & y lokacijo miške
class Location{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
 
// Zadržuje vrednosti točk poligona x in y
class PolygonPoint{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
// Shrani zgoraj levo x in y ter velikost oblik
let shapeBoundingBox = new ShapeBoundingBox(0,0,0,0);
// Drži položaj x in y, kjer je kliknjen
let mousedown = new MouseDownPos(0,0);
// Zadržuje x & y lokacijo miške
let loc = new Location(0,0);
 
// Pokliče, našo funkcijo da se izvede, ko se stran naloži
document.addEventListener('DOMContentLoaded', setupCanvas);
 
function setupCanvas(){
    // Pridobimo sklic/referenco na element platna
    canvas = document.getElementById('my-canvas');
    // Pridobimo metode za upravljanje s platnom
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = strokeColor;
    // Izvede ReactToMouseDown ko je miška pritisnjena
    canvas.addEventListener("mousedown", ReactToMouseDown);
    // Izvede ReactToMouseMove ko je miška pritisnjena
    canvas.addEventListener("mousemove", ReactToMouseMove);
    // Izvede ReactToMouseUp ko je miška pritisnjena
    canvas.addEventListener("mouseup", ReactToMouseUp);
}
 
function ChangeTool(toolClicked){
    document.getElementById("open").className = "";
    document.getElementById("save").className = "";
    document.getElementById("brush").className = "";
    document.getElementById("line").className = "";
    document.getElementById("rectangle").className = "";
    document.getElementById("circle").className = "";
    document.getElementById("ellipse").className = "";
    document.getElementById("polygon").className = "";
    //Označi zadnje izbrano orodje v orodni vrstici
    document.getElementById(toolClicked).className = "selected";
    //Spremeni trenutno orodje, ki se uporablja za risanje
    currentTool = toolClicked;
}

function ChangeColor(colorClicked){
    document.getElementById("black").className = "";
    document.getElementById("yellow").className = "";
    document.getElementById("red").className = "";
    document.getElementById("orange").className = "";
    document.getElementById("purple").className = "";
    document.getElementById("blue").className = "";
    document.getElementById("green").className = "";
    document.getElementById("greenyellow").className = "";
    document.getElementById("pink").className = "";
    document.getElementById("aqua").className = "";
    document.getElementById("brown").className = "";
    document.getElementById("grey").className = "";
    document.getElementById("white").className = "";

    document.getElementById(colorClicked).className = "color";

    strokeColor = colorClicked;
}

// Vrne položaj x in y miške glede na položaj platna na strani
function GetMousePosition(x,y){
    //Pridobimo velikost in položaj platna na spletni strani
    let canvasSizeData = canvas.getBoundingClientRect();
    return { x: (x - canvasSizeData.left) * (canvas.width  / canvasSizeData.width),
        y: (y - canvasSizeData.top)  * (canvas.height / canvasSizeData.height)
      };
}
 
function SaveCanvasImage(){
    // Shrani sliko
    savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
}
 
function RedrawCanvasImage(){
    // Obnovi sliko
    ctx.putImageData(savedImageData,0,0);
}
 
function UpdateRubberbandSizeData(loc){
    // Višina in širina sta razlika med klikom
    // in trenutni položaj miške
    shapeBoundingBox.width = Math.abs(loc.x - mousedown.x);
    shapeBoundingBox.height = Math.abs(loc.y - mousedown.y);
 
    // Če je miška pod mestom, kjer ste prvotno kliknili
    if(loc.x > mousedown.x){
        // Shranite miško navzdol, ker je najbolj levo
        shapeBoundingBox.left = mousedown.x;
    } else {
        //Shrani lokacijo miške, ker je najbolj levo
        shapeBoundingBox.left = loc.x;
    }
    // Če je lokacija miške pod lokacijo kjer smo prvotno kliknili
    if(loc.y > mousedown.y){
        // Shranite miško navzdol, ker je bližje vrhu
        // platna
        shapeBoundingBox.top = mousedown.y;
    } else {
        // V nasprotnem primeru shranite položaj miške
        shapeBoundingBox.top = loc.y;
    }
}
 
// Vrne kot z uporabo x in y
// x = priležna stranica
// y = nasprotna stranica
// Tan(kot) = nasprotna / priležna
// Kot = ArcTan (nasprotna / priležna)
function getAngleUsingXAndY(mouselocX, mouselocY){
    let adjacent = mousedown.x - mouselocX;
    let opposite = mousedown.y - mouselocY;
 
    return radiansToDegrees(Math.atan2(opposite, adjacent));
}
 
function radiansToDegrees(rad){
    if(rad < 0){
        // Popravite spodnjo napako tako, da dodate negativno
        // kot na 360, da dobite pravilen rezultat
        // cel krog
        return (360.0 + (rad * (180 / Math.PI))).toFixed(2);
    } else {
        return (rad * (180 / Math.PI)).toFixed(2);
    }
}
 
// Pretvori stopinje v radiane
function degreesToRadians(degrees){
    return degrees * (Math.PI / 180);
}
 
function getPolygonPoints(){
    // Pridobite kot v radianih na podlagi x in y lokacije miške
    let angle =  degreesToRadians(getAngleUsingXAndY(loc.x, loc.y));
 
    // X & Y za točko X & Y, ki predstavlja polmer, je enak
    // X in Y mejne škatle z gumijastim trakom
    let radiusX = shapeBoundingBox.width;
    let radiusY = shapeBoundingBox.height;
    // Shrani vse točke v poligonu
    let polygonPoints = [];
 
    // Vsako točko v poligonu najdemo tako, da prelomimo
    // dele mnogokotnika v trikotnike
    // Potem lahko uporabim znani kot in dolžino sosednje strani
    // da najdemo X = mouseLoc.x + radiusX * Sin(kot)
    // Najdete Y = mouseLoc.y + radiusY * Cos(angle)
    for(let i = 0; i < polygonSides; i++){
        polygonPoints.push(new PolygonPoint(loc.x + radiusX * Math.sin(angle),
        loc.y - radiusY * Math.cos(angle)));
 
        //2 * PI je enako 360 stopinj
        // Razdelite 360 ​​na dele glede na število poligonov
        // strani, ki jih želite
        angle += 2 * Math.PI / polygonSides;
    }
    return polygonPoints;
}
 
// Pridobimo točke poligona in narišite poligon
function getPolygon(){
    let polygonPoints = getPolygonPoints();
    ctx.beginPath();
    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for(let i = 1; i < polygonSides; i++){
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    ctx.closePath();
}

function drawColor(){
    fillColor = strokeColor;
}
 
// Pokličemo, da potegne črto
function drawRubberbandShape(loc){
    ctx.strokeStyle=strokeColor;
    if(currentTool === "brush"){
        // Ustvari čopič
        DrawBrush();
    } else if(currentTool === "line"){
        // Nariše črto
        ctx.beginPath();
        ctx.moveTo(mousedown.x, mousedown.y);
        ctx.lineTo(loc.x, loc.y);
        ctx.stroke();
    } else if(currentTool === "rectangle"){
        // Ustvari pravokotnike
        ctx.strokeRect(shapeBoundingBox.left, shapeBoundingBox.top, shapeBoundingBox.width, shapeBoundingBox.height);
    } else if(currentTool === "circle"){
        // Ustvari kroge
        let radius = shapeBoundingBox.width;
        ctx.beginPath();
        ctx.arc(mousedown.x, mousedown.y, radius, 0, Math.PI * 2);
        ctx.stroke();
    } else if(currentTool === "ellipse"){
        // Ustvarite elipse
        // ctx.ellipse(x, y, radiusX, radiusY, rotacija, startAngle, endAngle)
        let radiusX = shapeBoundingBox.width / 2;
        let radiusY = shapeBoundingBox.height / 2;
        ctx.beginPath();
        ctx.ellipse(mousedown.x, mousedown.y, radiusX, radiusY, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
    } else if(currentTool === "polygon"){
        // Ustvari mnogokotnike
        getPolygon();
        ctx.stroke();
    }
}
 
function UpdateRubberbandOnMove(loc){
    // Shrani spreminjanje višine, širine, položaja x in y večine
    // zgornja leva točka je lokacija klika ali miške
    UpdateRubberbandSizeData(loc);
 
    // Ponovno narišite obliko
    drawRubberbandShape(loc);
}
 
// Shrani vsako točko, ko se miška premika in ali je miška
// gumb se trenutno vleče
function AddBrushPoint(x, y, mouseDown){
    brushXPoints.push(x);
    brushYPoints.push(y);
    // Shrani, da je miška pritisnjena
    brushDownPos.push(mouseDown);

    brushColorPoints.push(strokeColor);
}

// Prehodite vse točke čopiča in jih povežite s črtami
function DrawBrush(){
    for(let i = 1; i < brushXPoints.length; i++){
        ctx.lineCap = 'round';
        ctx.beginPath();
        
        ctx.strokeStyle = brushColorPoints[i];
 
        // Preverite, ali je bil gumb miške na tej točki pritisnjen
        // in če je tako, nadaljujte z risanjem
        if(brushDownPos[i]){
            ctx.moveTo(brushXPoints[i-1], brushYPoints[i-1]);
        } else {
            ctx.moveTo(brushXPoints[i]-1, brushYPoints[i]);
        }
        ctx.lineTo(brushXPoints[i], brushYPoints[i]);
        ctx.closePath();
        ctx.stroke();
    }
}

function ReactToMouseDown(e){
    // Spremeni kazalec miške v križec
    canvas.style.cursor = "point";
    // Shrani lokacijo
    loc = GetMousePosition(e.clientX, e.clientY);
    // Shrani trenutno sliko platna
    SaveCanvasImage();
    // Shrani položaj miške ob kliku
    mousedown.x = loc.x;
    mousedown.y = loc.y;
    // Shrani, da drži miško pritisnjeno
    dragging = true;
 
    // Čopič bo shranil točke v niz
    if(currentTool === 'brush'){
        usingBrush = true;
        AddBrushPoint(loc.x, loc.y);
    }
}
 
function ReactToMouseMove(e){
    canvas.style.cursor = "crosshair";
    loc = GetMousePosition(e.clientX, e.clientY);
 
    // Če uporabljate orodje za čopič in vlečete, shranite vsako točko
    if(currentTool === 'brush' && dragging && usingBrush){
        // Odvrzi risbe s čopičem, ki se pojavijo zunaj platna
        if(loc.x > 0 && loc.x < canvasWidth && loc.y > 0 && loc.y < canvasHeight){
            AddBrushPoint(loc.x, loc.y, true);
        }
        RedrawCanvasImage();
        DrawBrush();
    } else {
        if(dragging){
            RedrawCanvasImage();
            UpdateRubberbandOnMove(loc);
        }
    }
}
 
function ReactToMouseUp(e){
    canvas.style.cursor = "default";
    loc = GetMousePosition(e.clientX, e.clientY);
    RedrawCanvasImage();
    UpdateRubberbandOnMove(loc);
    dragging = false;
    usingBrush = false;
}
 
// Shrani sliko v vaš privzeti imenik za prenos
function SaveImage(){
    // Pridobite sklic na element povezave
    var imageFile = document.getElementById("img-file");
    // Nastavite, da želite prenesti sliko, ko kliknete povezavo
    imageFile.setAttribute('download', 'image.png');
    // Za prenos se sklicujte na sliko v platnu
    imageFile.setAttribute('href', canvas.toDataURL());
}
 
function OpenImage(){
    let img = new Image();
    // Ko je slika naložena, počistite platno in začnite risati
    img.onload = function(){
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.drawImage(img,0,0);
    }
    img.src = 'image.png';
}