console.log('Extension running!!');
//document.body.onload = addElement;
let video;

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
        console.log(end - start);
    }
}

function addElement() {
    var newDiv = document.createElement("video");
    // and give it some content 
    var newContent = document.createTextNode("video is here!!");
    // add the text node to the newly created div
    newDiv.appendChild(newContent);
    newDiv.setAttribute("id", "video");
    // add the newly created element and its content into the DOM 
    var currentDiv = document.getElementsByTagName("div").lastChild;
    document.body.insertBefore(newDiv, currentDiv);
    console.log("element created");
    //video = document.getElementsByTagName("video");
    var newCanv = document.createElement("canvas");
    //newContent = document.createTextNode("video is here!!");
    newCanv.setAttribute("id", "canvas");
    newCanv.appendChild(newContent);
    document.body.insertBefore(newCanv, currentDiv);
    console.log("element created 2");
    //wait(2000);
    var newCanv = document.createElement("canvas");
    //newContent = document.createTextNode("video is here!!");
    newCanv.setAttribute("id", "canvasOutput");
    newCanv.appendChild(newContent);
    document.body.insertBefore(newCanv, currentDiv);
    console.log("element created 3");
    setTimeout(myFunction, 3000);
    function myFunction() {
        //alert('Hello');
    }
}
addElement();
var width = 320;
var height = 240;

let trackX = [];
let trackY = [];
let f_count = 0;
let scroll_amount = 0;
let sumy = 0;
let sumx = 0;
function startp() {
    let prevmp = new cv.Point(0, 0); //short for previous mid point

    //starting camera 
    // video is the id of video tag
    video = document.getElementById("video");
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
            console.log("video Playing!!");
            //document.getElementById('status').innerHTML = 'Started Camera!';
        })
        .catch(function (err) {
            console.log("An error occurred! " + err);
            //document.getElementById('status').innerHTML = 'Error Occured!';
        });

    let canvasFrame = document.getElementById("canvas"); // canvasFrame is the id of <canvas>
    let context = canvasFrame.getContext("2d");

    //creating required frames
    let src = new cv.Mat(height, width, cv.CV_8UC4);
    let dst = new cv.Mat(height, width, cv.CV_8UC1);
    let gray = new cv.Mat(height, width, cv.CV_8UC1);
    let mask = new cv.Mat(height, width, cv.CV_8UC1);
    let dilated = new cv.Mat(height, width, cv.CV_8UC1);

    let fgmask = new cv.Mat(height, width, cv.CV_8UC1);
    let fgbg = new cv.BackgroundSubtractorMOG2(500, 16, true);

    let ksize = new cv.Size(3, 3); //kernel size for guassian blur;

    //Variables required for skin colour masking

    //Variables for erosion
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);

    const FPS = 30;

    //processing video
    function processVideo() {
        let begin = Date.now();
        context.drawImage(video, 0, 0, width, height);
        src.data.set(context.getImageData(0, 0, width, height).data);
        cv.cvtColor(src, gray, cv.COLOR_BGR2GRAY);
        //cv.GaussianBlur(gray, mask, ksize, 0, 0, cv.BORDER_DEFAULT);

        //let low = new cv.Mat(src.rows, src.cols, src.type(), [90,80 ,33,0]);
        //let high = new cv.Mat(src.rows, src.cols, src.type(), [255, 173, 80, 255]);
        //cv.inRange(mask, low, high, fgmask);

        fgbg.apply(gray, fgmask);
        cv.erode(fgmask, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        cv.erode(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        cv.dilate(dst, dilated, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let hull = new cv.MatVector();
        cv.findContours(dilated, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        let cnt = contours.get(0);
        //        let Moments = cv.moments(dst, false);
        //        console.log(Moments.m00);

        /*
        // approximates each contour to convex hull
                for (let i = 0; i < contours.size(); ++i) {
                    let tmp = new cv.Mat();
                    let cnt = contours.get(i);
                    // You can try more different parameters
                    cv.convexHull(cnt, tmp, false, true);
                    hull.push_back(tmp);
                    cnt.delete(); tmp.delete();
                }
        // draw contours with random Scalar
                for (let i = 0; i < contours.size(); ++i) {
                    let colorHull = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                        Math.round(Math.random() * 255));
                    cv.drawContours(dst, hull, i, colorHull, 2, 8, hierarchy, 0);
                }   */

        let rect = cv.boundingRect(dst);
        let rectangleColor = new cv.Scalar(255, 0, 0);
        let point1 = new cv.Point(rect.x, rect.y);
        let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
        let pointmid = new cv.Point(rect.x + rect.width, rect.y + rect.height / 2);
        let area = rect.width * rect.height;

        let xx = pointmid.x - prevmp.x;
        let yy = pointmid.y - prevmp.y;
        if (area != 0) {
            console.log(xx + " " + yy + " fcount=" + f_count);
            prevmp = pointmid;
            trackX.push(xx);
            trackY.push(yy);
            sumy += yy;
            f_count++;
            if (f_count == 8) {
                scroll_amount = sumy / f_count;
                scrolll(15 * scroll_amount);
                f_count = 0;
                trackX = [];
                trackY = [];
                sumy = 0;
                //setTimeout(function delayer(){},5000);
            }
        } else {
            //do nothing
        }

        //scrolll(yy);
        cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);

        cv.imshow("canvasOutput", dst); // canvasOutput is the id of another <canvas>;
        // schedule next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    // schedule first one.
    setTimeout(processVideo, 0);
    //gray.delete();mask.delete();low.delete();high.delete();
}

function startfr() {

    //starting camera
    let video = document.getElementById("video"); // video is the id of video tag
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
            document.getElementById('status').innerHTML = 'Started Camera!';
        })
        .catch(function (err) {
            console.log("An error occurred! " + err);
            document.getElementById('status').innerHTML = 'Error Occured!';
        });

    let canvasFrame = document.getElementsByTagName("canvas"); // canvasFrame is the id of <canvas>
    let context = canvasFrame.getContext("2d");

    //creating required frames
    let src = new cv.Mat(height, width, cv.CV_8UC4);
    let dst = new cv.Mat(height, width, cv.CV_8UC1);
    let gray = new cv.Mat();
    let faces = new cv.RectVector();
    let classifier = new cv.CascadeClassifier();

    classifier.load('faces.xml');

    const FPS = 30;

    //processing video
    function processVideo() {
        let begin = Date.now();
        context.drawImage(video, 0, 0, width, height);
        src.data.set(context.getImageData(0, 0, width, height).data);
        src.copyTo(dst);
        cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

        classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
        // draw faces.
        for (let i = 0; i < faces.size(); ++i) {
            let face = faces.get(i);
            let point1 = new cv.Point(face.x, face.y);
            let point2 = new cv.Point(face.x + face.width, face.y + face.height);
            cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
        }
        cv.imshow('canvasOutput', dst);
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    setTimeout(processVideo, 0);
}

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    startp();
    //startfr();
}
document.getElementsByName("canvas").onload = startp();
function scrolll(yy) {
    window.scrollBy(0, yy);
}
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
        case "Scroll-Down":
            scrollDown();
            break;
        case "Scroll-Up":
            scrollUp();
            break;
        case "Back":
            backwd();
            break;
        case "newTab":
            newT();
            break;
    }
});

function scrollDown() {
    $("html, body").animate({
        scrollTop: $(document).scrollTop() + window.innerHeight - 100
    }, 400);
}

function scrollUp() {
    $("html, body").animate({
        scrollTop: $(document).scrollTop() - window.innerHeight + 100
    }, 400);
}

function backwd() {
    window.history.back();
}

function newT() {
    window.open("https://www.google.com");
}
// // var video = null;
// // var canvas = null;
// // var ctx = null;
// // createVideoHUD();
// // createCanvas();
// // startSnapshotting();

// function createVideoHUD() {
//     video = document.createElement('video');
//     video.setAttribute('autoplay', '');
//     video.setAttribute('width', '320');
//     video.setAttribute('height', '240');
//     video.style.position = 'fixed';
//     video.style.top = 0;
//     video.style.right = 0;
//     document.body.appendChild(video);

//     if (navigator.getUserMedia) {
//         navigator.getUserMedia({ video: true }, handleVideo, videoError);
//     }

//     function handleVideo(stream) {
//         video.src = window.URL.createObjectURL(stream);
//         video.play();
//     }

//     function videoError(e) {
//         alert("Error with webcam video.");
//         console.log(e);
//     }
// }

// function createCanvas() {
//     canvas = document.createElement('canvas');
//     canvas.setAttribute('width', '300');
//     canvas.setAttribute('height', '240');
//     canvas.style.position = 'fixed';
//     canvas.style.top = 0;
//     canvas.style.left = 0;
//     document.body.appendChild(canvas);
// }

// function startSnapshotting() {
//     ctx = canvas.getContext('2d');
//     var timer = setInterval(sendSnapshot, 20);
// }

// function sendSnapshot() {
//     ctx.drawImage(video, 0, 0, 300, 240);
//     var data = canvas.toDataURL('image/png');
//     chrome.extension.sendMessage({
//         type: "snapshot",
//         payload: data
//     });
// }