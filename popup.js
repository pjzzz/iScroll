var width=320;
var height=240;

function startp() {
    let video = document.getElementById("video"); // video is the id of video tag
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
            document.getElementById('status').innerHTML = 'Started Camera!';
        })
        .catch(function(err) {
            console.log("An error occurred! " + err);
            document.getElementById('status').innerHTML = 'Error Occured!';
        });

    let canvasFrame = document.getElementById("canvas"); // canvasFrame is the id of <canvas>
    let context = canvasFrame.getContext("2d");
    let src = new cv.Mat(height, width, cv.CV_8UC4);
    let dst = new cv.Mat(height, width, cv.CV_8UC1);
    let gray = new cv.Mat(height, width, cv.CV_8UC1);
    let ksize = new cv.Size(3, 3); //kernel size for guassian blur;
    const FPS = 30;
    function processVideo() {
        let begin = Date.now();
        context.drawImage(video, 0, 0, width, height);
        src.data.set(context.getImageData(0, 0, width, height).data);
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
        cv.imshow("canvasOutput", dst); // canvasOutput is the id of another <canvas>;
        // schedule next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
// schedule first one.
    setTimeout(processVideo, 0);
}

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    startp();
}

