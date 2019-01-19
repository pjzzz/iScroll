var width = 320;
var height = 240;

function startp() {
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

    let canvasFrame = document.getElementById("canvas"); // canvasFrame is the id of <canvas>
    let context = canvasFrame.getContext("2d");

    //creating required frames
    let src = new cv.Mat(height, width, cv.CV_8UC4);
    let dst = new cv.Mat(height, width, cv.CV_8UC1);
    let gray = new cv.Mat(height, width, cv.CV_8UC1);
    let mask = new cv.Mat(height, width, cv.CV_8UC1);

    let fgmask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let fgbg = new cv.BackgroundSubtractorMOG2(500, 16, true);

    let ksize = new cv.Size(3, 3); //kernel size for guassian blur;

    //Variables required for skin colour masking

    const FPS = 30;

    //processing video
    function processVideo() {
        let begin = Date.now();
        context.drawImage(video, 0, 0, width, height);
        src.data.set(context.getImageData(0, 0, width, height).data);
        //cv.cvtColor(src, gray, cv.COLOR_BGR2HSV);
        cv.GaussianBlur(src, mask, ksize, 0, 0, cv.BORDER_DEFAULT);

        let low = new cv.Mat(src.rows, src.cols, src.type(), [0, 0, 51, 0]);
        let high = new cv.Mat(src.rows, src.cols, src.type(), [255, 173, 80, 255]);

        cv.inRange(mask, low, high, dst);
        fgbg.apply(dst, fgmask);
        cv.imshow("canvasOutput", fgmask); // canvasOutput is the id of another <canvas>;
        // schedule next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }
    // schedule first one.
    setTimeout(processVideo, 0);
    //gray.delete();mask.delete();low.delete();high.delete();
}

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    startp();
}

