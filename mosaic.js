
let rubicSize = 3;
let padding = 1;
//let cube = [[255, 255, 255], [255,255,0], [255,0,0], [0,0,255], [255,165,0], [0,255,0]];
let cube = [[255,255,255],
[255,0,0],
[0,255,0],
[0,0,255],
[255,255,0],
[0,255,255],
[255,0,255],
[128,0,0],
[128,128,0],
[0,128,0],
[128,0,128],
[0,128,128],
[0,0,128]];

function showInputImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function (e) {
            document.getElementById('imageOutput').hidden = true;
            document.getElementById('imageInput').src = e.target.result;
            document.getElementById('imageInput').hidden = false;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

function calPixelDiff(pixelA, pixelB)
{
    let deltaR = pixelA[0] - pixelB[0];
    let deltaG = pixelA[1] - pixelB[1];
    let deltaB = pixelA[2] - pixelB[2];
    let R = (pixelA[0] + pixelB[0])/2;

    return Math.sqrt(2*deltaR*deltaR + 4*deltaG*deltaG + 3*deltaB*deltaB);
}

function getCube(cube, avgRGB)
{
    let min = 10000;
    let pixel;
    for(let i=0; i<cube.length; i++)
    {
        let diff = calPixelDiff(cube[i], avgRGB);
        if (diff<min)
        {
            min = diff;
            pixel = cube[i];
        }
    }
    return pixel;
}

function isValidPixel(rows, cols, i, j)
{
    if((i<0 || i > rows-1) || (j<0 || j > cols-1))
    {
        return false;
    }
    return true;
}

function getRGB(srcImage, i, j)
{
    let R = srcImage.ucharPtr(i, j)[0];
    let G = srcImage.ucharPtr(i, j)[1];
    let B = srcImage.ucharPtr(i, j)[2];
    return [R, G, B];
}

function calAvgRGB(pixels)
{
    let avgRGB = [0, 0, 0];
    for(let i = 0; i < pixels.length; i++)
    {
        avgRGB[0]+=pixels[i][0];
        avgRGB[1]+=pixels[i][1];
        avgRGB[2]+=pixels[i][2];
    }
    avgRGB[0] = Math.floor(avgRGB[0]/pixels.length);
    avgRGB[1] = Math.floor(avgRGB[1]/pixels.length);
    avgRGB[2] = Math.floor(avgRGB[2]/pixels.length);
    
    return avgRGB;
}

function convert()
{
    let srcImage = cv.imread('imageInput');
    let dstImage = new cv.Mat(srcImage.rows, srcImage.cols, cv.CV_8UC3, new cv.Scalar(0, 0, 0));
    let rows = srcImage.rows;
    let cols = srcImage.cols;
    let i;
    let j;

    for (i = 0; i < rows; i+=rubicSize+padding) {
        for (j = 0; j < cols; j+=rubicSize+padding) {
            
            let pixels = [];
            for(let k = 0; k<rubicSize; k++)
            {
                for(let p = 0; p<rubicSize; p++)
                {
                    if(isValidPixel(rows, cols, i+k, j+p))
                    {
                        pixels.push(getRGB(srcImage, i+k, j+p));
                    }
                    else pixels.push([0, 0, 0]);
                }
            }

            let avgRGB = calAvgRGB(pixels);
            let pixel = getCube(cube, avgRGB);
        
            for(let k = 0; k<rubicSize; k++)
            {
                for(let p = 0; p<rubicSize; p++)
                {
                    if(isValidPixel(rows, cols, i+k, j+p))
                    {
                        dstImage.ucharPtr(i+k, j+p)[0] = pixel[0];
                        dstImage.ucharPtr(i+k, j+p)[1] = pixel[1];
                        dstImage.ucharPtr(i+k, j+p)[2] = pixel[2];
                    }
                }
            }
                  
        }
    }
    let canvasOutput = document.getElementById('imageOutput');
    cv.imshow(canvasOutput, dstImage);
    document.getElementById('imageOutput').hidden = false;
}

document.getElementById('imageInput').hidden = true;
document.getElementById('imageOutput').hidden = true;
