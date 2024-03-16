blur = document.querySelector("#blur"),
makeSquareBtn = document.getElementById("make-square"),
colorSquareBtn = document.getElementById("color-square"),
backgroundColorInput = document.getElementById("background-color"),
uploadButton = document.getElementById("upload-button"),
previewCanvas = document.createElement("canvas"),
downloadCanvas = document.createElement("canvas"),
previewCtx = previewCanvas.getContext("2d"),
downloadCtx = downloadCanvas.getContext("2d"),
imageContainer = document.querySelector(".image-container"),
resizeSquareBtn = document.getElementById("resize-square");
const cropSquareBtn = document.getElementById("crop-square");
const blurOptionDiv = document.getElementById("blur-option");
const colorOptionDiv = document.getElementById("color-option");

let image = new Image(),
myImage = null;
let croppieInstance;
const fixedCanvasSize = 800;
let croppieLoaded = false;

const dropZone = document.getElementById("drop-zone");




dropZone.addEventListener("dragover", (e) => {
e.preventDefault();
e.dataTransfer.dropEffect = "copy";
});
dropZone.addEventListener("drop", (e) => {
e.preventDefault();
handleFiles(e.dataTransfer.files);
});


async function loadJSZip() {
return new Promise((resolve, reject) => {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js";
  script.onload = () => resolve();
  script.onerror = () => reject("Failed to load JSZip library");
  document.body.appendChild(script);
});
}

cropSquareBtn.addEventListener("change", async () => {
if (cropSquareBtn.checked && !croppieLoaded) {
    try {
        await loadCroppie();
        croppieLoaded = true;
        console.log("Croppie library loaded successfully");
    } catch (error) {
        console.error("Failed to load Croppie library:", error);
    }
}

if (myImage) {
    myImage.draw();
}
});

function loadCroppie() {
return new Promise((resolve, reject) => {
    // Load Croppie CSS
    const croppieCSS = document.createElement('link');
    croppieCSS.rel = 'stylesheet';
    croppieCSS.href = 'https://squareanimage.vercel.app/croppie.min.css';
    document.head.appendChild(croppieCSS);

 
    const croppieJS = document.createElement('script');
    croppieJS.src = 'https://squareanimage.vercel.app/croppie.min.js';
    croppieJS.onload = () => resolve();
    croppieJS.onerror = () => reject('Failed to load Croppie library');
    document.body.appendChild(croppieJS);
});
}



class CanvasImage {
constructor(e, t, a, i) {
    (this.type = e),
        (this.width = t),
        (this.height = a),
        (this.size = "horizontal" === e ? t : a),
        (this.bigWidth = "horizontal" === e ? (t * t) / a : a),
        (this.bigHeight = "horizontal" === e ? t : (a * a) / t),
        (this.image = i),
        (this.filter = null);
}
changeFilter(e) {
    this.filter = e;
}



async draw() {
    imageContainer.innerHTML = "";

    if (cropSquareBtn.checked) {
       
        
        const croppieContainer = document.createElement("div");
        croppieContainer.setAttribute("id", "croppie-container");

        imageContainer.appendChild(croppieContainer);



        croppieInstance = new Croppie(croppieContainer, {
            viewport: {
                width:250,
                height: 250,
            },
            boundary: {
                width:  300,
                height:300,
            },
            showZoomer: true,
            enableOrientation: true,
           Zoom: 0,
        });

        croppieInstance.bind({
            url: this.image.src,
            zoom:0,
        });
        croppieInstance.setZoom(0);
     
    } 

    else if (resizeSquareBtn.checked) {
        [previewCanvas, downloadCanvas].forEach((e, t) => {
            let a = e.getContext("2d"),
                i = 0 === t ? 800 / this.size : 1;
            a.clearRect(0, 0, e.width, e.height);
            e.width = this.size * i;
            e.height = this.size * i;
            a.drawImage(this.image, 0, 0, e.width, e.height);
        });
    } else if (colorSquareBtn.checked) {
        let e = backgroundColorInput.value;
        [previewCanvas, downloadCanvas].forEach((t, a) => {
            let i = t.getContext("2d"),
                n = 0 === a ? 800 / this.size : 1;
            i.clearRect(0, 0, t.width, t.height);
            t.width = this.size * n;
            t.height = this.size * n;
            i.fillStyle = e;
            i.fillRect(0, 0, t.width, t.height);
            i.drawImage(this.image, (t.width - this.width * n) / 2, (t.height - this.height * n) / 2, this.width * n, this.height * n);
        });
    } else if (makeSquareBtn.checked) {
        
        [previewCanvas, downloadCanvas].forEach((e, t) => {
            let a = e.getContext("2d"),
                i = 0 === t ? 800 / this.size : 1;
            a.clearRect(0, 0, e.width, e.height);
            e.width = this.size * i;
            e.height = this.size * i;
            a.translate(this.size * i / 2, this.size * i / 2);
            a.filter = `blur(${blur.value}px)`;
            a.drawImage(this.image, -(this.bigWidth * i) / 2, -(this.bigHeight * i) / 2, this.bigWidth * i, this.bigHeight * i);
            a.filter = "none";
            a.drawImage(this.image, -(this.width * i) / 2, -(this.height * i) / 2, this.width * i, this.height * i);
        });
    }

    imageContainer.appendChild(previewCanvas);
}

}
const download = document.querySelector(".download");
download.addEventListener("click", async () => {
if (cropSquareBtn.checked && croppieInstance) {
    download.disabled = true;
    croppieInstance.result({ type: "blob", size: "original" }).then((blob) => {
        new Compressor(blob, {
            quality: 0.9,
            maxWidth: myImage.width,
            maxHeight: myImage.height,
            success(compressedBlob) {
                let a = document.createElement("a");
                (a.download = "Cropped_Image.png"),
                    (a.href = URL.createObjectURL(compressedBlob)),
                    a.click(),
                    URL.revokeObjectURL(a.href),
                    setTimeout(() => {
                        download.disabled = false;
                    }, 500);
            },
            error(error) {
                console.log(error.message),
                    setTimeout(() => {
                        download.disabled = false;
                    }, 500);
            },
        });
    });
} else{
    download.disabled = !0;
    let e = downloadCanvas.toDataURL("image/png");
    try {
        let t = await (await fetch(e)).blob();
        new Compressor(t, {
            quality: 0.9,
            maxWidth: downloadCanvas.width,
            maxHeight: downloadCanvas.height,
            success(e) {
                let t = URL.createObjectURL(e),
                    a = document.createElement("a");
                (a.download = "Image_Editor.png"),
                    (a.href = t),
                    a.click(),
                    URL.revokeObjectURL(t),
                    setTimeout(() => {
                        download.disabled = !1;
                    }, 500);
            },
            error(e) {
                console.log(e.message),
                    setTimeout(() => {
                        download.disabled = !1;
                    }, 500);
            },
        });
    } catch (a) {
        console.error("Error fetching the image blob:", a),
            setTimeout(() => {
                download.disabled = !1;
            }, 500);
    }
}
});





(uploadButton.onchange = () => {
    
    let e = new FileReader();

    var container = document.querySelector('.upload');
    container.style.display = 'none';

    e.readAsDataURL(uploadButton.files[0]),
        (e.onload = () => {
            (image.src = e.result),
                (image.onload = function () {
                    let e = this.width > this.height ? "horizontal" : "vertical",
                        t = this.height,
                        a = this.width;
                    download.classList.remove("hidden"), (myImage = new CanvasImage(e, a, t, image)).draw();
                });
        });
}),







makeSquareBtn.addEventListener("input", () => {
    (colorSquareBtn.checked = !1), myImage.draw();
}),
colorSquareBtn.addEventListener("input", () => {
    (makeSquareBtn.checked = !1), myImage.draw();
}),

blur.addEventListener("input", (e) => {
    let t = e.target;
    "range" !== e.target.type && (t = document.getElementById("range"));
    let a = t.min,
        i = t.max,
        n = t.value;
    (t.style.backgroundSize = ((n - a) * 100) / (i - a) + "% 100%"), image.src && myImage.draw();
}),
document.addEventListener("DOMContentLoaded", async () => {


    



    await loadCroppie();
  

    croppieLoaded = true;
    let e = document.getElementById("color-square"),
        t = document.getElementById("color-option");
    e.addEventListener("change", function () {
        e.checked ? (t.style.display = "block") : (t.style.display = "none");
    });
}),


makeSquareBtn.addEventListener("change",() => {
    blurOptionDiv.style.display = "block";
    colorOptionDiv.style.display = "none";
    previewCanvas.style.display = "block";
    if (myImage) {
        myImage.draw();
    }
  });
  
  colorSquareBtn.addEventListener("change",() => {
    blurOptionDiv.style.display = "none";
    colorOptionDiv.style.display = "block";
    previewCanvas.style.display = "block";
    if (myImage) {
        myImage.draw();
    }
  });
  
  resizeSquareBtn.addEventListener("change",() => {
    blurOptionDiv.style.display = "none";
    colorOptionDiv.style.display = "none";
    if (myImage) {
        previewCanvas.style.display = "block";
        myImage.draw();
    }
  });
  cropSquareBtn.addEventListener("change", () => {
    blurOptionDiv.style.display = "none";
    colorOptionDiv.style.display = "none";
    previewCanvas.style.display = "none";
    if (myImage) {
  
      myImage.draw();
    }
    
  });
  
  backgroundColorInput.addEventListener("input", () => {
    if (myImage) {
      myImage.draw();
    }
  });
