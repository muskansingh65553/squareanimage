
function showLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'none';
}
let canvas, bgImg, img;
const canvasSize = 270; 

function applyBlurToImage(imageElement, blurValue) {
    const offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = imageElement.width;
    offScreenCanvas.height = imageElement.height;

    const ctx = offScreenCanvas.getContext('2d');
    ctx.filter = `blur(${blurValue * 20}px)`; 
    ctx.drawImage(imageElement, 0, 0);

    return offScreenCanvas.toDataURL();
}

function createCustomRatioInput() {
    const customRatioDiv = document.createElement('div');
    customRatioDiv.id = 'customRatioInput';

    const label = document.createElement('label');
    label.htmlFor = 'customRatio';
    label.textContent = 'Custom Aspect Ratio (e.g., 4:3):';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'customRatio';
    input.placeholder = 'e.g., 4:3';

    customRatioDiv.appendChild(label);
    customRatioDiv.appendChild(input);

    document.getElementById('aspectRatio').insertAdjacentElement('afterend', customRatioDiv);

    input.addEventListener('input', updateCanvas);
}

function removeCustomRatioInput() {
    const customRatioDiv = document.getElementById('customRatioInput');
    if (customRatioDiv) {
        customRatioDiv.parentNode.removeChild(customRatioDiv);
    }
}

document.getElementById('aspectRatio').addEventListener('change', function() {
    if (this.value === 'custom') {
        createCustomRatioInput();
    } else {
        removeCustomRatioInput();
    }
    updateCanvas();
});

function getCanvasDimensions(ratio) {
    let widthRatio, heightRatio;

    if (ratio === 'custom') {
        const customRatio = document.getElementById('customRatio').value;
        [widthRatio, heightRatio] = customRatio.split(':').map(Number);
        if (!widthRatio || !heightRatio) {

            widthRatio = 1;
            heightRatio = 1;
        }
    } else {
        [widthRatio, heightRatio] = ratio.split(':').map(Number);
    }

    const height = canvasSize * (heightRatio / widthRatio);
    return { width: canvasSize, height };
}

function updateCanvas() {

    if (!canvas) {
        console.error('Canvas object is not initialized.');
        return; 
    }

    const blurValue = parseFloat(document.getElementById('blurControl').value);
    const aspectRatio = document.getElementById('aspectRatio').value;
    const mainImageScale = parseFloat(document.getElementById('mainImageScale').value);
    const bgImageScale = parseFloat(document.getElementById('bgImageScale').value);
    const { width, height } = getCanvasDimensions(aspectRatio);

    canvas.setDimensions({ width: width, height: height });

    if (bgImg && img) {
        const imgScale = Math.min(width / img.width, height / img.height) * mainImageScale;
        const bgScale = Math.max(width / bgImg.width, height / bgImg.height) * bgImageScale;

        bgImg.set({
            scaleX: bgScale,
            scaleY: bgScale,
            top: (height - bgImg.height * bgScale) / 2,
            left: (width - bgImg.width * bgScale) / 2
        });

        img.set({
            scaleX: imgScale,
            scaleY: imgScale,
            top: (height - img.height * imgScale) / 2,
            left: (width - img.width * imgScale) / 2
        });

        canvas.renderAll();
    }
}

document.getElementById('mainImageScale').addEventListener('input', updateCanvas);
document.getElementById('bgImageScale').addEventListener('input', updateCanvas);

document.getElementById('imageUpload').addEventListener('change', function(e) {
    var container = document.querySelector('.ont');
    container.style.display = 'grid';
    showLoadingIndicator();
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageElement = new Image();
        imageElement.onload = function() {
            const blurredDataURL = applyBlurToImage(imageElement, parseFloat(document.getElementById('blurControl').value));

            fabric.Image.fromURL(blurredDataURL, function(bgImage) {
                fabric.Image.fromURL(event.target.result, function(oImg) {
                    canvas = new fabric.Canvas('canvas');
                    img = oImg;
                    bgImg = new fabric.Image(bgImage.getElement(), { selectable: false });
                    canvas.add(bgImg);
                    canvas.add(img);
                    updateCanvas();
                    hideLoadingIndicator();
                });
            });
        };
        imageElement.src = event.target.result;

    };
    if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
});

document.getElementById('blurControl').addEventListener('input', function() {
    if (img) {
        const imageElement = new Image();
        imageElement.onload = function() {
            const blurredDataURL = applyBlurToImage(imageElement, parseFloat(document.getElementById('blurControl').value));
            fabric.Image.fromURL(blurredDataURL, function(bgImage) {
                bgImg.setElement(bgImage.getElement());
                updateCanvas();
            });
        };
        imageElement.src = img.toDataURL();
    }
});

document.getElementById('aspectRatio').addEventListener('change', updateCanvas);

function downloadImage() {
    const multiplier = 4; 

    const dataURL = canvas.toDataURL({
        format: 'png',
        multiplier: multiplier
    });

    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'high-res-image.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

document.getElementById('downloadBtn').addEventListener('click', downloadImage);