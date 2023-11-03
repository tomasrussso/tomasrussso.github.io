// $('html, body').hide();

// $(document).ready(function() {
//     $('html, body').show();
// });

// Variavel para controlar se o user fez alguma alteracao no itinerário
var hasEdited = false;

var elements = {
    paragraph: '<div class="card paragraph" id="%id%"> <div class="d-flex flex-column flex-md-row"> <div class="paragraph-text d-flex flex-grow-1"> <textarea onblur="SaveContent(\'%id%\', this)" class="w-100" name="textarea-%id%" id="textarea-%id%" placeholder="Escreva alguma coisa..."></textarea> </div> <div class="elements-options d-flex flex-row flex-md-column justify-content-start align-items-end"> <button class="btn" onclick="GoUp(\'%id%\')"><i class="fas fa-chevron-up"></i></button> <button class="btn" onclick="GoDown(\'%id%\')"><i class="fas fa-chevron-down"></i></button> <button class="btn" onclick="RemoveElement(\'%id%\')"><i class="fas fa-trash-alt"></i></button> </div> </div> </div>',
    local: '<div class="card local" id="%id%"> <div class="d-flex flex-column flex-md-row justify-content-start"> <div class="row"> <div class="col-md-3 align-self-center"> <a href="%url%" target="_blank"><img class="img-fluid" src="%image%" alt="%title%"></a> </div> <div class="col-md-9"> <div class="card-body"> <a href="%url%" class="link" target="_blank"><h5 class="card-title">%title%</h5></a> <p class="card-text review"><span class="stars">%stars%</span><a href="%url%" class="link" target="_blank">%rating% no Google</a></p> <p class="card-text">%description%</p> </div> </div> </div> <div class="elements-options d-flex flex-row flex-md-column justify-content-start align-items-end"> <button class="btn" onclick="GoUp(\'%id%\')"><i class="fas fa-chevron-up"></i></button> <button class="btn" onclick="GoDown(\'%id%\')"><i class="fas fa-chevron-down"></i></button> <button class="btn" onclick="RemoveElement(\'%id%\')"><i class="fas fa-trash-alt"></i></button> </div> </div> </div>',
    image: '<div class="card image" id="%id%"> <div class="d-flex flex-column flex-md-row justify-content-start"> <div class="wrapper-image"> <img class="img-fluid" src="%image%" alt=""> </div> <div class="elements-options d-flex flex-row flex-md-column justify-content-start align-items-end"> <button class="btn" onclick="GoUp(\'%id%\')"><i class="fas fa-chevron-up"></i></button> <button class="btn" onclick="GoDown(\'%id%\')"><i class="fas fa-chevron-down"></i></button> <button class="btn" onclick="RemoveElement(\'%id%\')"><i class="fas fa-trash-alt"></i></button> </div> </div> </div>'
}

var imagesToMove = {};
var imagesToDelete = {};

var itineraryJson = JSON.parse(initialJson);

SetTextareas();

function SaveAndExit() {
    if(!hasEdited) {
        window.location.href = url + '/itinerary/' + redirect;
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText);
            if (xhttp.responseText == 0) {
                EnableButton(document.getElementById('save-button'), '<i class="fas fa-save"></i>Guardar e Sair');
                LaunchToast('Ocorreu um erro inesperado a processar o seu pedido.<br><br><b>Não fez alterações ao seu itinerário?</b> Carregue antes em "Sair".', 'red');
                hasEdited = false;
                imagesToDelete = {};
            } else if (xhttp.responseText == 1) {
                hasEdited = false;
                window.location.href = url + '/itinerary/' + redirect;
            }
        }
    };
    xhttp.open("POST", url + "/source/itinerary/save.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("json=" + encodeURIComponent(JSON.stringify(itineraryJson)) + "&imagesToMove=" + encodeURIComponent(JSON.stringify(imagesToMove)) + "&imagesToDelete=" + encodeURIComponent(JSON.stringify(imagesToDelete)));
}

// Remover elemento pelo ID (todos)
function RemoveElement(elementId) {
    hasEdited = true;

    dayNumber = GetElementsDayNumberInContentById(elementId, itineraryJson.content);
    elementIndex = GetElementsArrayIndexInDayById(elementId, itineraryJson.content['day-' + dayNumber]);

    if (GetElementInDayById(elementId, itineraryJson.content['day-' + dayNumber]).type == "image") {
        if (imagesToMove[elementId] == null) {
            src = GetElementInDayById(elementId, itineraryJson.content['day-' + dayNumber]).src;
        } else {
            src = imagesToMove[elementId];
        }
        delete imagesToMove[elementId];
        imagesToDelete[elementId] = src;
    }

    itineraryJson.content['day-' + dayNumber].splice(elementIndex, 1);

    $('#' + elementId).remove(); 
    
    console.log(itineraryJson);
    console.log('delete');
    console.log(imagesToDelete);
    console.log('move');
    console.log(imagesToMove);
}

// Salvar o conteudo editado (paragrafo)
function SaveContent(elementId, elementDom) {
    hasEdited = true;

    paragraphObject = GetElementInContentById(elementId, itineraryJson.content);
    newValue = elementDom.value;

    newValue = EscapeSpecialCharsHtml(newValue);

    paragraphObject.value = EscapeSpecialCharsJson(newValue);

    console.log(itineraryJson);
}

// Adicionar paragrafo ao ID do dia
function AddParagraph(day) {
    hasEdited = true;

    idParagraph = ++itineraryJson.lastInsertId;

    var jsonParagraph = {
        "id": idParagraph,
        "type": "paragraph",
        "value": ""
    };
    itineraryJson.content[day].push(jsonParagraph);

    var domParagraph = ReplaceAll(elements.paragraph, '%id%', idParagraph);
    $('#' + day).append(domParagraph);

    SetTextareas();

    console.log(itineraryJson);
}

function AddLocal(day) {
    document.getElementById('btn-submit-local').setAttribute('onClick', 'SubmitLocal(\'' + day + '\')');

    $(document).ready(function(){
        $("#addLocal").modal('show');
    });
}

function AddImage(day) {
    document.getElementById('btn-submit-image').setAttribute('onClick', 'SetLoading(this, document.getElementById(\'picture\')); SubmitImage(\'' + day + '\')');

    $(document).ready(function(){
        $("#addImage").modal('show');
    });
}

function SubmitLocal(day) {
    if (typeof place == 'undefined') return;

    hasEdited = true;

    idLocal = ++itineraryJson.lastInsertId;

    if (place.photos == null) {
        var localPhoto = '%SITE_URL%/images/image-placeholder.png';
    } else {
        var localPhoto = place.photos[0].getUrl();
    }

    if (place.rating == null) {
        var rating = 'Sem classificação';
    } else {
        var rating = place.rating.toFixed(1);
    }

    var jsonLocal = {
        "id": idLocal,
        "type": "local",
        "url": place.url,
        "image": localPhoto,
        "title": place.name,
        "description": place.formatted_address,
        "rating": rating
    };
    itineraryJson.content[day].push(jsonLocal);

    var domLocal = ReplaceAll(elements.local, '%id%', idLocal);
    var domLocal = ReplaceAll(domLocal, '%url%', place.url);
    var domLocal = ReplaceAll(domLocal, '%image%', localPhoto);
    var domLocal = ReplaceAll(domLocal, '%title%', place.name);
    var domLocal = ReplaceAll(domLocal, '%description%', place.formatted_address);
    var domLocal = ReplaceAll(domLocal, '%rating%', rating);
    var domLocal = ReplaceAll(domLocal, '%stars%', PrintReviewStars(rating));
    var domLocal = ReplaceAll(domLocal, '%SITE_URL%', url);

    $('#' + day).append(domLocal);

    $("#addLocal").modal('hide');
    $("#local-box").val('');

    delete place;

    console.log(itineraryJson);
}

async function SubmitImage(day) {
    if ($("#picture").val() == '') return;

    var imagePath = '';

    let formData = new FormData(); 
    formData.append("file", document.getElementById('picture').files[0]);
    formData.append("id_user", u);
    formData.append("id_itinerary", i);
    await fetch(url + "/source/itinerary/add-image.php", {
        method: "POST", 
        body: formData
    }).then(function (res) {
        return res.text();
    })
    .then(function (text) {
        imagePath = text;
    }).catch(function(error) {
        console.log('Fetch error: ' + error.message);
        $("#addImage").modal('hide');
        $("#picture").val('');
        EnableButton(document.getElementById('btn-submit-image'), 'Adiconar imagem');
        LaunchToast('Ocorreu um erro inesperado a processar o seu pedido. Tente novamente.', 'red');
        return;
    });

    if (imagePath == '0') {
        $("#addImage").modal('hide');
        $("#picture").val('');
        EnableButton(document.getElementById('btn-submit-image'), 'Adiconar imagem');
        LaunchToast('Não foi possível carregar a sua imagem. Visite o Centro de Ajuda para mais informações.', 'red');
        return;
    }

    hasEdited = true;

    idImage = ++itineraryJson.lastInsertId;

    var src = '%SITE_URL%' + imagePath;

    var jsonImage = {
        "id": idImage,
        "type": "image",
        "src": ReplaceAll(src, '/temp/', '/public/')
    }

    itineraryJson.content[day].push(jsonImage);

    imagesToMove[idImage] = src;

    var domImage = ReplaceAll(elements.image, '%id%', idImage);
    var domImage = ReplaceAll(domImage, '%image%', src);
    var domImage = ReplaceAll(domImage, '%SITE_URL%', url);

    $('#' + day).append(domImage);

    $("#addImage").modal('hide');
    $("#picture").val('');
    EnableButton(document.getElementById('btn-submit-image'), 'Adiconar imagem');

    console.log(itineraryJson);
    console.log(imagesToMove);
}

// Move o elemento ID para cima
function GoUp(elementId){
    dayNumber = GetElementsDayNumberInContentById(elementId, itineraryJson.content);
    currentIndex = GetElementsArrayIndexInDayById(elementId, itineraryJson.content['day-' + dayNumber]);
    if (currentIndex == 0) {
        return;
    }
    
    hasEdited = true;

    upperIndex = currentIndex - 1;

    temp = itineraryJson.content['day-' + dayNumber][upperIndex];
    itineraryJson.content['day-' + dayNumber][upperIndex] = itineraryJson.content['day-' + dayNumber][currentIndex];
    itineraryJson.content['day-' + dayNumber][currentIndex] = temp;

    $('#' + elementId).insertBefore($('#' + elementId).prev());
    document.getElementById(elementId).scrollIntoView({behavior: "smooth", block: "center"});

    console.log(itineraryJson);
}

// Move o elemento ID para baixo
function GoDown(elementId){
    dayNumber = GetElementsDayNumberInContentById(elementId, itineraryJson.content);
    currentIndex = GetElementsArrayIndexInDayById(elementId, itineraryJson.content['day-' + dayNumber]);
    dayLength = itineraryJson.content['day-' + dayNumber].length;
    if (currentIndex == dayLength - 1) {
        return;
    }

    hasEdited = true;
    
    lowerIndex = currentIndex + 1;
    
    temp = itineraryJson.content['day-' + dayNumber][lowerIndex];
    itineraryJson.content['day-' + dayNumber][lowerIndex] = itineraryJson.content['day-' + dayNumber][currentIndex];
    itineraryJson.content['day-' + dayNumber][currentIndex] = temp;

    $('#' + elementId).insertAfter($('#' + elementId).next());
    document.getElementById(elementId).scrollIntoView({behavior: "smooth", block: "center"});

    console.log(itineraryJson);
}

// -------------------------- FUNCOES e OUTROS --------------------------

// Função para evitar que o user feche a pagina com alterações feitas
window.onbeforeunload = function (e) {
    if (!hasEdited) return;

    var e = e || window.event;

    //IE & Firefox
    if (e) {
        e.returnValue = 'Are you sure?';
    }

    // For Safari
    return 'Are you sure?';
};

// Toast do CTRL+Z
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        LaunchToast('Função em desenvolvimento ;)');
    }
});

function SetTextareas() {
    $("textarea").each(function () {
        this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
    }).on("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
}

function ReplaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

// Busca o elemento pelo ID no dia inserido (no JSON parsed)
function GetElementInDayById (elementId, dayArray) {
    if (dayArray == null) {
        return -1;
    }

    var i, len = dayArray.length;

    for (i = 0; i < len; i++) {
        if (dayArray[i].id == elementId) {
            return dayArray[i];
        }
    }

    return -1;
}

function GetElementsArrayIndexInDayById (elementId, dayArray) {
    if (dayArray == null) {
        return -1;
    }

    var i, len = dayArray.length;

    for (i = 0; i < len; i++) {
        if (dayArray[i].id == elementId) {
            return i;
        }
    }

    return -1;
}

function GetElementInContentById (elementId, contentObject) {
    if (contentObject == null) {
        return -1;
    }

    var i, j, len = contentLength;

    for (i = 1; i <= len; i++) {
        for (j = 0; j < contentObject['day-' + i].length; j++) {
            if (contentObject['day-' + i][j].id == elementId) {
                return contentObject['day-' + i][j];
            }
        }
    }

    return -1;
}

function GetElementsDayNumberInContentById (elementId, contentObject) {
    if (contentObject == null) {
        return -1;
    }

    var i, j, len = contentLength;

    for (i = 1; i <= len; i++) {
        for (j = 0; j < contentObject['day-' + i].length; j++) {
            if (contentObject['day-' + i][j].id == elementId) {
                return i;
            }
        }
    }

    return -1;
}

function EscapeSpecialCharsJson(string) {
    return string.replace(/\n/g, "<br>")
        .replace(/\r/g, "<br>")
        .replace(/\t/g, "<br>")
        .replace(/\f/g, "<br>");
}

function EscapeSpecialCharsHtml(string) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return string.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function PrintReviewStars(rating) {
    int = rating.toString().substring(0, 1);
    dec = rating.toString().substring(2, 3);

    stars = '';
    starsRemaning = 5;

    for (var i = 1; i <= int; i++) {
        starsRemaning--;
        stars += '<i class="fas fa-star"></i>';
    }

    if (starsRemaning == 0) {
        return stars;
    } 

    if (dec > 2) {
        starsRemaning--;
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    if (starsRemaning == 0) {
        return stars;
    } 

    for (var i = 1; i <= starsRemaning; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

function EnableButton(button, content) {
    button.disabled = false;
    button.innerHTML = content;
    button.removeAttribute('style');
}