var defaultValues = {
    CODE128 : "Example 1234",
    CODE128A : "EXAMPLE",
    CODE128B : "Example text",
    CODE128C : "12345678",
    EAN13 : "893838600001",
    // EAN13 : "1234567890128",
    EAN8 : "12345670",
    UPC : "123456789999",
    CODE39 : "EXAMPLE TEXT",
    ITF14 : "10012345000017",
    ITF : "123456",
    MSI : "123456",
    MSI10 : "123456",
    MSI11 : "123456",
    MSI1010 : "123456",
    MSI1110 : "123456",
    pharmacode : "1234"
};

$(document).ready(function(){
    let downloadPngBtn = document.getElementById("download-png");
    let downloadSvgBtn = document.getElementById("download-svg");

    downloadPngBtn.removeEventListener("click", downloadPNG);
    downloadSvgBtn.removeEventListener("click", downloadSVG);

    downloadPngBtn.addEventListener("click", downloadPNG);
    downloadSvgBtn.addEventListener("click", downloadSVG);

    $("#barcodeType").val("EAN13");
    $("#userInput").val(defaultValues["EAN13"]);

    $("#userInput").on('input',newBarcode);

    $("#barcodeType").change(function(){
        $("#userInput").val( defaultValues[$(this).val()] );

        newBarcode();
    });

    $(".text-align").click(function(){
      $(".text-align").removeClass("btn-primary");
      $(this).addClass("btn-primary");

      newBarcode();
    });

    $(".font-option").click(function(){
      if($(this).hasClass("btn-primary")){
        $(this).removeClass("btn-primary");
      }
      else{
        $(this).addClass("btn-primary");
      }

      newBarcode();
    });

    $(".display-text").click(function(){
      $(".display-text").removeClass("btn-primary");
      $(this).addClass("btn-primary");

      if($(this).val() == "true"){
        $("#font-options").slideDown("fast");
      }
      else{
        $("#font-options").slideUp("fast");
      }

      newBarcode();
    });

    $("#font").change(function(){
      $(this).css({"font-family": $(this).val()});
      newBarcode();
    });

    $('input[type="range"]').rangeslider({
        polyfill: false,
        rangeClass: 'rangeslider',
        fillClass: 'rangeslider__fill',
        handleClass: 'rangeslider__handle',
        onSlide: newBarcode,
        onSlideEnd: newBarcode
    });

    $('.color').colorPicker({renderCallback: newBarcode});

    newBarcode();
});

var newBarcode = function() {
    var code = $("#userInput").val();
    if($("#barcodeType").val() == "EAN13" && code.length == 12)
      code += calculateEAN13Checksum(code);

    //Convert to boolean
    $("#barcode").JsBarcode(code,
        {
          "format": $("#barcodeType").val(),
          "background": $("#background-color").val(),
          "lineColor": $("#line-color").val(),
          "fontSize": parseInt($("#bar-fontSize").val()),
          "height": parseInt($("#bar-height").val()),
          "width": $("#bar-width").val(),
          "margin": parseInt($("#bar-margin").val()),
          "textMargin": parseInt($("#bar-text-margin").val()),
          "displayValue": $(".display-text.btn-primary").val() == "true",
          "font": $("#font").val(),
          "fontOptions": $(".font-option.btn-primary").map(function(){return this.value;}).get().join(" "),
          "textAlign": $(".text-align.btn-primary").val(),
          "valid":
            function(valid){
              if(valid){
                $("#barcode").show();
                $("#invalid").hide();
              }
              else{
                $("#barcode").hide();
                $("#invalid").show();
              }
            }
        });

    $("#bar-width-display").text($("#bar-width").val());
    $("#bar-height-display").text($("#bar-height").val());
    $("#bar-fontSize-display").text($("#bar-fontSize").val());
    $("#bar-margin-display").text($("#bar-margin").val());
    $("#bar-text-margin-display").text($("#bar-text-margin").val());
};

function calculateEAN13Checksum(code) {
    if (code.length !== 12) throw new Error("EAN-13 must have 12 digits before checksum");

    let sumOdd = 0, sumEven = 0;

    for (let i = 0; i < 12; i++) {
        let num = parseInt(code[i], 10);
        if (i % 2 === 0) sumOdd += num;
        else sumEven += num;
    }

    let total = sumOdd + (sumEven * 3);
    let checksum = (10 - (total % 10)) % 10;

    return checksum;
}

function downloadPNG() {
    let svg = document.getElementById("barcode");
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let img = new Image();

    let svgData = new XMLSerializer().serializeToString(svg);
    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    let url = URL.createObjectURL(svgBlob);

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        downloadImage(canvas.toDataURL("image/png"), "barcode.png");
    };

    img.src = url;
}

function downloadSVG() {
    let svg = document.getElementById("barcode");
    let svgData = new XMLSerializer().serializeToString(svg);
    let blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    let url = URL.createObjectURL(blob);

    downloadImage(url, "barcode.svg");
    URL.revokeObjectURL(url);
}

function downloadImage(dataUrl, filename) {
    let link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
