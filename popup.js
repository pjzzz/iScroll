var width = 320;
var height = 240;


function startp() {
    let prevmp = new cv.Point(0, 0);
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
    let dilated = new cv.Mat(height, width, cv.CV_8UC1);

    let fgmask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
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

        //fgbg.apply(gray, fgmask);
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
        let pointmid = new cv.Point(rect.x + rect.width / 2, rect.y + rect.height / 2);

        let xx = pointmid.x - prevmp.x;
        let yy = pointmid.y - prevmp.y;
        console.log(xx + " " + yy);
        scrolll(yy);
        prevmp = pointmid;

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

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    startp();
}

function scrolll(yy) {
    window.scrollBy(0, yy);
}
