// JavaScript Document
/*eslint-env es6*/
//make the object

//initialize array of numbers representing types

function init(){

let wide_tim_src_images = [];
const wide_tim_objects = [];

//initialize the images
let HeadRight = new Image('100','100');
HeadRight.src = "wider-src/head-r.png";

let HeadLeft = new Image('100','100');
HeadLeft.src = "wider-src/head-l.png";

let HeadLeftRight = new Image('100','100');
HeadLeftRight.src = "wider-src/head-lr.png";

let ElbowIn = new Image('100','100');
ElbowIn.src = "wider-src/elbow-in.png";

let ElbowOut = new Image('100','100');
ElbowOut.src = "wider-src/elbow-out.png";
    
let BodyLine = new Image('100','100');
BodyLine.src = "wider-src/line.png";  

let CrossLeft =new Image('100','100');
CrossLeft.src = "wider-src/cross-1.png"; 
    
let CrossRight =new Image('100','100');  
CrossRight.src = "wider-src/cross-2.png";   
   
wide_tim_src_images.push(HeadLeftRight, ElbowIn, ElbowOut, BodyLine, CrossLeft, CrossRight, HeadRight, HeadLeft)
const rotation_angles = Array(25).fill(0);
 
//this is to detect if any key is pressed. 1= something pressed and 0=nothing pressed. Used later.
var key_pressed = 0;
    

document.addEventListener('keydown', function(){
    key_pressed =1;
  }
);
    
document.addEventListener('keyup', function(){
  key_pressed =0;
    /*
  var name = event.key;
  var code = event.code;
  console.log(`Key released ${name} \r\n Key code value: ${code}`);
  console.log(key_pressed);
  */
});
    
//initialize the wide_tim_object array and wide_tim_images array
for (let i=1; i<=5;i++){
    for (let j=1; j<=5; j++){
        const image_ij = document.getElementById(""+i+""+j+"");
        //console.log("object detected: "+i+""+j+"");
        wide_tim_objects.push(image_ij);
        const rand = Math.floor(Math.random()*6);
        var ind = rand;
        image_ij.src = wide_tim_src_images[ind].src;
   
        //click once to change picture
        image_ij.addEventListener("click",function(){
            //no hold of key: change picture
            if(key_pressed==0){
             rotation_angles[5*i+j-6]=(rotation_angles[5*i+j-6]+90)%360;
            image_ij.style.transform = "rotate("+rotation_angles[5*i+j-6]+"deg)";   
                
            }else if(key_pressed==1){
            //click and hold some key to rotate
                ind = (ind+1)%6;
            image_ij.src = wide_tim_src_images[ind].src;
           
            }
        });
    }
}
   
}
window.onload = init;