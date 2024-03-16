// $('html, body').hide();

// $(document).ready(function() {
//     $('html, body').show();
// });

// Variavel para controlar se o user fez alguma alteracao no itinerário
var hasEdited = false;

var currentId = 100;

var elements = {
  paragraph:
    '<div class="card paragraph" id="%id%"> <div class="d-flex flex-column flex-md-row"> <div class="paragraph-text d-flex flex-grow-1"> <textarea onblur="SaveContent(\'%id%\', this)" class="w-100" name="textarea-%id%" id="textarea-%id%" placeholder="Escreva alguma coisa..."></textarea> </div> <div class="elements-options d-flex flex-row flex-md-column justify-content-start align-items-end"> <button class="btn" onclick="GoUp(\'%id%\')"><i class="fas fa-chevron-up"></i></button> <button class="btn" onclick="GoDown(\'%id%\')"><i class="fas fa-chevron-down"></i></button> <button class="btn" onclick="RemoveElement(\'%id%\')"><i class="fas fa-trash-alt"></i></button> </div> </div> </div>',
  local:
    '<div class="card local" id="%id%"> <div class="d-flex flex-column flex-md-row justify-content-start"> <div class="row"> <div class="col-md-3 align-self-center"> <a href="%url%" target="_blank"><img class="img-fluid" src="%image%" alt="%title%"></a> </div> <div class="col-md-9"> <div class="card-body"> <a href="%url%" class="link" target="_blank"><h5 class="card-title">%title%</h5></a> <p class="card-text review"><span class="stars">%stars%</span><a href="%url%" class="link" target="_blank">%rating% no Google</a></p> <p class="card-text">%description%</p> </div> </div> </div> <div class="elements-options d-flex flex-row flex-md-column justify-content-start align-items-end"> <button class="btn" onclick="GoUp(\'%id%\')"><i class="fas fa-chevron-up"></i></button> <button class="btn" onclick="GoDown(\'%id%\')"><i class="fas fa-chevron-down"></i></button> <button class="btn" onclick="RemoveElement(\'%id%\')"><i class="fas fa-trash-alt"></i></button> </div> </div> </div>',
  image:
    '<div class="card image" id="%id%"> <div class="d-flex flex-column flex-md-row justify-content-start"> <div class="wrapper-image"> <img class="img-fluid" src="%image%" alt=""> </div> <div class="elements-options d-flex flex-row flex-md-column justify-content-start align-items-end"> <button class="btn" onclick="GoUp(\'%id%\')"><i class="fas fa-chevron-up"></i></button> <button class="btn" onclick="GoDown(\'%id%\')"><i class="fas fa-chevron-down"></i></button> <button class="btn" onclick="RemoveElement(\'%id%\')"><i class="fas fa-trash-alt"></i></button> </div> </div> </div>',
};

SetTextareas();

function SaveAndExit() {
  hasEdited = false;
  window.location.href = "itinerary-my.html";
}

// Remover elemento pelo ID (todos)
function RemoveElement(elementId) {
  hasEdited = true;
  $("#" + elementId).remove();
}

// Adicionar paragrafo ao ID do dia
function AddParagraph(day) {
  hasEdited = true;

  var domParagraph = ReplaceAll(elements.paragraph, "%id%", currentId++);
  $("#" + day).append(domParagraph);

  SetTextareas();
}

function AddLocal(day) {
  document
    .getElementById("btn-submit-local")
    .setAttribute("onClick", "SubmitLocal('" + day + "')");

  $(document).ready(function () {
    $("#addLocal").modal("show");
  });
}

function AddImage(day) {
  document
    .getElementById("btn-submit-image")
    .setAttribute(
      "onClick",
      "SetLoading(this, document.getElementById('picture')); SubmitImage('" +
        day +
        "')"
    );

  $(document).ready(function () {
    $("#addImage").modal("show");
  });
}

function SubmitLocal(day) {
  hasEdited = true;

  var domLocal = ReplaceAll(elements.local, "%id%", currentId++);
  var domLocal = ReplaceAll(domLocal, "%url%", "");
  var domLocal = ReplaceAll(domLocal, "%image%", "./images/bolhao.jpg");
  var domLocal = ReplaceAll(domLocal, "%title%", "Mercado do Bolhão");
  var domLocal = ReplaceAll(
    domLocal,
    "%description%",
    "Mercado icónico com muitos vendedores"
  );
  var domLocal = ReplaceAll(domLocal, "%rating%", 4.3);
  var domLocal = ReplaceAll(domLocal, "%stars%", PrintReviewStars(4.3));
  var domLocal = ReplaceAll(domLocal, "%SITE_URL%", "");

  $("#" + day).append(domLocal);

  $("#addLocal").modal("hide");
}

async function SubmitImage(day) {
  hasEdited = true;

  var domImage = ReplaceAll(elements.image, "%id%", currentId++);
  var domImage = ReplaceAll(domImage, "%image%", "./images/portugal.jpg");
  var domImage = ReplaceAll(domImage, "%SITE_URL%", "");

  $("#" + day).append(domImage);

  $("#addImage").modal("hide");
  $("#picture").val("");
  EnableButton(document.getElementById("btn-submit-image"), "Adiconar imagem");
}

// Move o elemento ID para cima
function GoUp(elementId) {
  //   if (currentIndex == 0) {
  //     return;
  //   }

  hasEdited = true;

  $("#" + elementId).insertBefore($("#" + elementId).prev());
  document
    .getElementById(elementId)
    .scrollIntoView({ behavior: "smooth", block: "center" });
}

// Move o elemento ID para baixo
function GoDown(elementId) {
  //   if (currentIndex == dayLength - 1) {
  //     return;
  //   }

  hasEdited = true;

  $("#" + elementId).insertAfter($("#" + elementId).next());
  document
    .getElementById(elementId)
    .scrollIntoView({ behavior: "smooth", block: "center" });
}

// -------------------------- FUNCOES e OUTROS --------------------------

// Função para evitar que o user feche a pagina com alterações feitasx
window.onbeforeunload = function (e) {
  if (!hasEdited) return;

  var e = e || window.event;

  //IE & Firefox
  if (e) {
    e.returnValue = "Are you sure?";
  }

  // For Safari
  return "Are you sure?";
};

// Toast do CTRL+Z
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "z") {
    LaunchToast("Função em desenvolvimento ;)");
  }
});

function SetTextareas() {
  $("textarea")
    .each(function () {
      this.setAttribute(
        "style",
        "height:" + this.scrollHeight + "px;overflow-y:hidden;"
      );
    })
    .on("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
}

function ReplaceAll(str, find, replace) {
  return str.replace(new RegExp(find, "g"), replace);
}

function EscapeSpecialCharsJson(string) {
  return string
    .replace(/\n/g, "<br>")
    .replace(/\r/g, "<br>")
    .replace(/\t/g, "<br>")
    .replace(/\f/g, "<br>");
}

function EscapeSpecialCharsHtml(string) {
  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return string.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

function PrintReviewStars(rating) {
  int = rating.toString().substring(0, 1);
  dec = rating.toString().substring(2, 3);

  stars = "";
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
  button.removeAttribute("style");
}
